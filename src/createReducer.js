import {loop, Cmd} from 'redux-loop';
import Maybe from 'maybe';
import {
    START_WORKFLOW,
    CHANGE_FLOW_STATUS,
    COMPLETE_WORKFLOW,
    changeFlowStatusAction,
    completeWorkflowAction
} from './actions';
import flowStatuses from './statuses/flowStatuses';
import workflowStatuses from './statuses/workflowStatuses';

export default (flowsFunctions, workflowsDetails) => (state, action) => {
    switch (action.type) {
        case START_WORKFLOW:
            return startWorkflow(workflowsDetails, state, action);
        case CHANGE_FLOW_STATUS:
            return startFlow(flowsFunctions, state, action);
        case COMPLETE_WORKFLOW:
            return completeWorkflow(flowsFunctions, workflowsDetails, state, action);
    }
    return state;
};

const startWorkflow = (workflowsDetails, state, action) => {
    if (state.activeWorkflowsDetails.some(workflowDetails => workflowDetails.workflowId === action.workflowId))
        return state;

    const workflowDetailsIndex = workflowsDetails.findIndex(workflow =>
        action.type === START_WORKFLOW && workflow.workflowName === action.workflowName);

    // the workflow does not exist by the given name in the action.
    if (workflowDetailsIndex === -1)
        return state;

    const workflowDetails = workflowsDetails[workflowDetailsIndex];

    const newActiveWorkflowDetails = {
        workflowId: action.workflowId,
        workflowName: workflowDetails.workflowName,
        head: duplicateWorkflowGraph(workflowDetails.head),
        workflowStatus: workflowStatuses.started
    };
    return loop(
        {
            ...state,
            activeWorkflowsDetails: [...state.activeWorkflowsDetails, newActiveWorkflowDetails],
        },
        workflowDetails.head.isNothing() ?
            Cmd.none :
            Cmd.action(changeFlowStatusAction(action.workflowId, workflowDetails.head.value().flowDetails.flowName, flowStatuses.started))
    );
};

const startFlow = (flowsFunctions, state, action) => {
    if (!state.activeWorkflowsDetails.some(workflowDetails => workflowDetails.workflowId === action.workflowId))
        return state;

    const activeWorkflowDetailsIndex = state.activeWorkflowsDetails.findIndex(activeWorkflow => activeWorkflow.workflowId === action.workflowId);

    if (activeWorkflowDetailsIndex === -1)
        return state;

    const activeWorkflowDetails = state.activeWorkflowsDetails[activeWorkflowDetailsIndex];

    // find the node of the flow that is completed.

    // Note: execution of the same flow in parallel is not supported so there
    //       is no way that the same flow will be more then one in the following array.
    const uncompletedNodes = getCurrentLeafsOfWorkflowGraph(activeWorkflowDetails.head);

    const completedNodeIndex = uncompletedNodes.findIndex(node =>
        node.flowDetails.flowName === action.flowName &&
        node.flowDetails.flowStatus === action.flowStatus
    );

    // check if this flow shouldn't complete now or at all or there are no flows at this workflow.
    if (completedNodeIndex === -1)
        return state;

    const updatedNode = {
        ...uncompletedNodes[completedNodeIndex],
        isCompleted: true,
        completeTime: action.flowStatusCompleteTime
    };
    const updatedActiveWorkflowDetails = {
        ...activeWorkflowDetails,
        head: duplicateWorkflowGraph(activeWorkflowDetails.head, updatedNode)
    };

    const actionsToTrigger = isWorkflowCompleted(updatedActiveWorkflowDetails.head) ?
        [Cmd.action(completeWorkflowAction(action.workflowId))] :
        getActionsToTrigger(flowsFunctions, updatedActiveWorkflowDetails.head, uncompletedNodes[completedNodeIndex].childs, action);

    return loop({
            ...state,
            activeWorkflowsDetails: [
                ...state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId !== updatedActiveWorkflowDetails.workflowId),
                updatedActiveWorkflowDetails
            ]
        },
        Cmd.list(actionsToTrigger)
    );
};

const completeWorkflow = (flowsFunctions, workflowsDetails, state, action) => {
    if (!state.activeWorkflowsDetails.some(workflowDetails => workflowDetails.workflowId === action.workflowId))
        return state;

    const activeWorkflowDetailsIndex = state.activeWorkflowsDetails.findIndex(activeWorkflow => activeWorkflow.workflowId === action.workflowId);

    if (activeWorkflowDetailsIndex === -1)
        return state;

    const activeWorkflowDetails = state.activeWorkflowsDetails[activeWorkflowDetailsIndex];

    if (!isWorkflowCompleted(activeWorkflowDetails.head))
        return state;

    const completedWorkflow = {
        ...activeWorkflowDetails,
        completeTime: action.completeWorkflowTime,
        workflowStatus: workflowStatuses.completed
    };
    return loop({
            ...state,
            activeWorkflowsDetails: state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId !== activeWorkflowDetails.workflowId),
            nonActiveWorkflowsDetails: [...state.nonActiveWorkflowsDetails, completedWorkflow]
        },
        Cmd.none);
};

const duplicateWorkflowGraph = (head, ...updatedNodes) => {
    function duplicate(node) {
        const updatedNodeIndex = updatedNodes.findIndex(updatedNode => node.flowDetails === updatedNode.flowDetails);
        return Object.assign(
            {},
            node,
            {childs: node.childs.map(duplicate)},
            updatedNodeIndex > -1 ? updatedNodes[updatedNodeIndex] : {}
        );
    }

    return head.isNothing() ?
        Maybe.Nothing :
        Maybe(duplicate(head.value()));
};

const getActionsToTrigger = (flowsFunctions, head, childNodesToStart, currentAction) =>
    childNodesToStart.filter(child => areParentsCompleted(head, child))
        .map(child => changeFlowStatusAction(currentAction.workflowId, child.flowDetails.flowName, child.flowDetails.flowStatus))
        .map(actionToTrigger => actionToTrigger.flowStatus !== flowStatuses.selfResolved ?
            Cmd.action(actionToTrigger) :
            Cmd.run(flowsFunctions[actionToTrigger.flowName], {
                successActionCreator: () => actionToTrigger,
                args: [currentAction.workflowId]
            }));

// search every node in possibleLeafs and check that it's parents are all completed:
const areParentsCompleted = (head, possibleLeaf) => {
    function searchParents(node) {
        if (node === possibleLeaf)
        // * if it's true then node === head because if not and the node's
        // parent is possibleLeaf then I will stop the recursion so this
        // condition will never be true.
        // * if head === possibleLeaf => he doesn't have parents so
        //                               logically it's correct to say
        //                               that they are all completed.
            return true;
        if (node.childs.length > 0 &&
            node.childs.some(child =>
                // possibleLeaf belong to the graph before the deep-copy so the condition child===possibleLeaf will be false.
                // because child belongs to the deep-copied graph.
                child.flowDetails === possibleLeaf.flowDetails))
            return node.hasOwnProperty('isCompleted') && node.isCompleted;

        // I didn't find the parent yet so we will keep searching.
        if (node.childs.length === 0)
            return true;

        return node.childs.every(searchParents);
    }

    // if head is Nothing then no one will call this method.
    // this condition is only for unit-tests on this specific function.
    return head.isNothing() ?
        true :
        searchParents(head.value());
};

// return an array of all closest nodes to head that are not completed but their parent is completed.
const getCurrentLeafsOfWorkflowGraph = head => {
    function findLeafs(node) {
        if (!node.hasOwnProperty('isCompleted') || !node.isCompleted)
            return [node];
        return node.childs.flatMap(findLeafs);
    }

    const possibleLeafs = head.isNothing() ?
        [] :
        // I may receive nodes such as node3: {node1: completed, node2: not completed } -> {node3: not completed}
        // so I should get only [node2] and not [node2,node3].
        findLeafs(head.value());

    return possibleLeafs.filter(leaf => areParentsCompleted(head, leaf));
};

const isWorkflowCompleted = head => {
    function areAllNodesCompleted(node) {
        if (!node.hasOwnProperty('isCompleted') || !node.isCompleted)
            return false;
        if (node.childs.length === 0)
            return true;
        // it's enough to check only one path.
        return areAllNodesCompleted(node.childs[0]);
    }

    return head.isNothing() ?
        true :
        areAllNodesCompleted(head.value());
};