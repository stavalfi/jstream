import {loop, Cmd} from 'redux-loop';
import Maybe from 'maybe';
import {START_WORKFLOW, START_FLOW, flowActionCreator} from './actionsCreators';
import flowStatuses from './statuses/flowStatuses';
import workflowStatuses from './statuses/workflowStatuses';

export default (flowsFunctions, workflowsDetails) => (state, action) => {
    switch (action.type) {
        case START_WORKFLOW:
            return startWorkflow(workflowsDetails, state, action);
        case START_FLOW:
            return startFlow(flowsFunctions, state, action);
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
            Cmd.action(flowActionCreator(action.workflowId, workflowDetails.head.value().flowDetails.flowName, flowStatuses.started))
    );
};

const startFlow = (flowsFunctions, state, action) => {
    if (!state.activeWorkflowsDetails.some(workflowDetails => workflowDetails.workflowId === action.workflowId))
        return state;

    if (!Object.values(flowStatuses).some(flowStatus => flowStatus === action.flowStatus))
        return state;

    const activeWorkflowDetailsIndex = state.activeWorkflowsDetails.findIndex(activeWorkflow => activeWorkflow.workflowId === action.workflowId);

    if (activeWorkflowDetailsIndex === -1)
        return state;

    const activeWorkflowDetails = state.activeWorkflowsDetails[activeWorkflowDetailsIndex];

    // find the node of the flow that is completed.

    // Note: execution of the same flow in parallel is not supported so there
    //       is no way that the same flow will be more then one in the following array.
    const uncompletedNodes = getCurrentLeafsOfWorkflowGraph(activeWorkflowDetails.head);

    const completedNodeIndex = uncompletedNodes.findIndex(node => node.flowDetails.flowName === action.flowName);

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

    // is workflow completed.
    if (isWorkflowCompleted(updatedActiveWorkflowDetails.head)) {
        const completedWorkflow = {
            ...updatedActiveWorkflowDetails,
            completeTime: action.flowStatusCompleteTime,
            workflowStatus: workflowStatuses.completed
        };
        return loop({
                ...state,
                activeWorkflowsDetails: state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId !== updatedActiveWorkflowDetails.workflowId),
                nonActiveWorkflowsDetails: [...state.nonActiveWorkflowsDetails, completedWorkflow]
            },
            Cmd.none);
    }

    return loop({
            ...state,
            activeWorkflowsDetails: [
                ...state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId !== updatedActiveWorkflowDetails.workflowId),
                updatedActiveWorkflowDetails
            ]
        },
        Cmd.list(getActionsToTrigger(flowActionCreator, flowsFunctions, uncompletedNodes[completedNodeIndex].childs, action))
    );
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

const getActionsToTrigger = (flowActionCreator, flowsFunctions, childNodesToStart, currentAction) =>
    childNodesToStart.map(child => flowActionCreator(currentAction.workflowId, child.flowDetails.flowName, child.flowDetails.flowStatus))
        .map(actionToTrigger => actionToTrigger.flowStatus !== flowStatuses.selfResolved ?
            Cmd.action(actionToTrigger) :
            Cmd.run(flowsFunctions[actionToTrigger.flowName], {
                successActionCreator: () => actionToTrigger,
                args: [currentAction.workflowId]
            }));

// return an array of all closest nodes to head that are not completed but their parent is completed.
const getCurrentLeafsOfWorkflowGraph = head => {
    function findLeafs(node) {
        if (!node.hasOwnProperty('isCompleted') || !node.isCompleted)
            return [node];
        return node.childs.flatMap(findLeafs);
    }

    return head.isNothing() ?
        [] :
        findLeafs(head.value());
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