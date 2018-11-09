import {loop, Cmd} from 'redux-loop';
import Optional from 'optional-js';
import {
    START_WORKFLOW,
    CHANGE_FLOW_STATUS,
    COMPLETE_WORKFLOW,
    changeFlowStatusAction,
    completeWorkflowAction
} from './actions';
import flowStatuses from './statuses/flowStatuses';
import workflowStatuses from './statuses/workflowStatuses';

export default (functions, workflowsDetails) => (state, action) => {
    switch (action.type) {
        case START_WORKFLOW:
            return startWorkflow(Optional.ofNullable(functions.startWorkflowsFunctions), workflowsDetails, state, action);
        case CHANGE_FLOW_STATUS:
            return changeFlowStatus(functions.flowsFunctions, Optional.ofNullable(functions.completeWorkflowsFunctions), state, action);
        case COMPLETE_WORKFLOW:
            return completeWorkflow(Optional.ofNullable(functions.completeWorkflowsFunctions), workflowsDetails, state, action);
    }
    return state;
};

const startWorkflow = (startWorkflowsFunctions, workflowsDetails, state, action) => {
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
        head: initializeGraph(workflowDetails.head),
        workflowStatus: workflowStatuses.started
    };

    const newState = {
        ...state,
        activeWorkflowsDetails: [...state.activeWorkflowsDetails, newActiveWorkflowDetails],
    };

    const startWorkflowFunction = startWorkflowsFunctions.isPresent() ?
        Optional.ofNullable(startWorkflowsFunctions.get()[action.workflowName]) :
        Optional.empty();

    if (!workflowDetails.head.isPresent() && startWorkflowFunction.isPresent())
        return loop(newState, Cmd.list([Cmd.run(startWorkflowFunction.get(), {
            args: [action.workflowId]
        })]));

    if (!workflowDetails.head.isPresent() && !startWorkflowFunction.isPresent())
        return loop(newState, Cmd.list([]));

    const actionToDispatch = changeFlowStatusAction(action.workflowId, workflowDetails.head.get().flowDetails.flowName, flowStatuses.started);


    if (!!workflowDetails.head.isPresent() && startWorkflowFunction.isPresent())
        return loop(newState, Cmd.list([Cmd.run(startWorkflowFunction.get(), {
            successActionCreator: () => actionToDispatch,
            args: [action.workflowId]
        })]));

    // workflowDetails.head.isPresent() && !startWorkflowFunction.isPresent() === true
    return loop(newState, Cmd.list([Cmd.action(actionToDispatch)]));
};

const changeFlowStatus = (flowsFunctions, completeWorkflowsFunctions, state, action) => {
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
        head: createNewGraphWithNodesUpdates(activeWorkflowDetails.head, updatedNode)
    };

    const newState = {
        ...state,
        activeWorkflowsDetails: [
            ...state.activeWorkflowsDetails.slice(0, activeWorkflowDetailsIndex),
            updatedActiveWorkflowDetails,
            ...state.activeWorkflowsDetails.slice(activeWorkflowDetailsIndex + 1)
        ]
    };

    const isWorkflowFinished = isWorkflowCompleted(updatedActiveWorkflowDetails.head);

    const completeWorkflowFunction = completeWorkflowsFunctions.isPresent() ?
        Optional.ofNullable(completeWorkflowsFunctions.get()[updatedActiveWorkflowDetails.workflowName]) :
        Optional.empty();

    const completedWorkflowAction = completeWorkflowAction(action.workflowId);

    if (isWorkflowFinished && completeWorkflowFunction.isPresent())
        return loop(newState, Cmd.list([
            Cmd.run(completeWorkflowFunction.get(), {
                successActionCreator: () => completedWorkflowAction,
                args: [action.workflowId]
            })
        ]));

    if (isWorkflowFinished && !completeWorkflowFunction.isPresent())
        return loop(newState, Cmd.list([Cmd.action(completedWorkflowAction)]));

    // workflow is not completed.

    const actionsToDispatch = getActionsToTrigger(flowsFunctions, updatedActiveWorkflowDetails.head, uncompletedNodes[completedNodeIndex].childs, action);

    return loop(newState, Cmd.list(actionsToDispatch));
};

const completeWorkflow = (functions, workflowsDetails, state, action) => {
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

    const newState = {
        ...state,
        activeWorkflowsDetails: state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId !== activeWorkflowDetails.workflowId),
        nonActiveWorkflowsDetails: [...state.nonActiveWorkflowsDetails, completedWorkflow]
    };

    return loop(newState, Cmd.list([]));
};

function initializeGraph(head) {
    if (!head.isPresent())
        return head;

    function duplicateNode(node) {
        return {
            ...node,
            childs: node.childs.map(duplicateNode),
            isCompleted: false
        };
    }

    const newHead = duplicateNode(head.get());
    return Optional.of(newHead);
}

const createNewGraphWithNodesUpdates = (head, ...updatedNodes) => {
    if (!head.isPresent())
        return head;

    function generatedUpdatedParents(head, updatedNode) {
        if (head.flowDetails === updatedNode.flowDetails)
            return updatedNode;

        return getNodeParents(Optional.of(head), updatedNode)
            .map((_, i) => i)
            .reduce((newHead, i) => {
                const oldParent = getNodeParents(Optional.of(newHead), updatedNode)[i];
                const nodeIndex = oldParent.childs.findIndex(child => child.flowDetails === updatedNode.flowDetails);
                const newParent = {
                    ...oldParent,
                    childs: [...oldParent.childs.slice(0, nodeIndex), updatedNode, ...oldParent.childs.slice(nodeIndex + 1)]
                };
                return generatedUpdatedParents(newHead, newParent);
            }, head);
    }

    const newHead = updatedNodes.reduce((newHead, updatedNode) => generatedUpdatedParents(newHead, updatedNode), head.get());
    return Optional.of(newHead);
};

const getActionsToTrigger = (flowsFunctions, head, childNodesToStart, currentAction) =>
    childNodesToStart.filter(child => getNodeParents(head, child).every(node => node.isCompleted))
        .map(child => changeFlowStatusAction(currentAction.workflowId, child.flowDetails.flowName, child.flowDetails.flowStatus))
        .map(actionToTrigger => actionToTrigger.flowStatus !== flowStatuses.selfResolved ?
            Cmd.action(actionToTrigger) :
            Cmd.run(flowsFunctions[actionToTrigger.flowName], {
                successActionCreator: () => actionToTrigger,
                args: [currentAction.workflowId]
            }));

// get all node's parents
// the given node may not be present by reference in the graph so we check this by NODE.id.
const getNodeParents = (head, node) => {
    if (!head.isPresent() || head.get().flowDetails === node.flowDetails)
        return [];

    function search(pos) {
        if (pos.childs.length > 0) {
            // possibleLeaf belong to the graph before the deep-copy so the condition child===possibleLeaf will be false.
            // because child belongs to the deep-copied graph.
            const isNodeAChild = pos.childs.some(child => child.flowDetails === node.flowDetails);
            if (isNodeAChild)
                return [pos];
        }

        // I didn't find the parent yet so we will keep searching.
        if (pos.childs.length === 0)
            return [];

        return pos.childs.flatMap(search);
    }

    return search(head.get());
};

// return an array of all closest nodes to head that are not completed but their parent is completed.
const getCurrentLeafsOfWorkflowGraph = head => {
    if (!head.isPresent())
        return [];

    function findLeafs(node) {
        if (!node.isCompleted)
            return [node];
        return node.childs.flatMap(findLeafs);
    }

    // I may receive nodes such as node3: {node1: completed, node2: not completed } -> {node3: not completed}
    // so I should get only [node2] and not [node2,node3].
    const possibleLeafs = findLeafs(head.get());

    return possibleLeafs.filter(leaf => getNodeParents(head, leaf).every(node => node.isCompleted));
};

const isWorkflowCompleted = head => {
    if (!head.isPresent())
        return true;

    function areAllNodesCompleted(node) {
        if (!node.isCompleted)
            return false;
        if (node.childs.length === 0)
            return true;
        // it's enough to check only one path.
        return areAllNodesCompleted(node.childs[0]);
    }

    return areAllNodesCompleted(head.get());
};