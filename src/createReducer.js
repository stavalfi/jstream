import flowStatuses from './statuses/flowStatuses';
import workflowStatuses from './statuses/workflowStatuses';
import {loop, Cmd} from 'redux-loop';
import Maybe from 'maybe';

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

const isActionValid = (actions, workflowsDetails, nonActiveWorkflowsDetails, action) => {
    if (!actions.hasOwnProperty(action.flowName))
        return false;

    if (!workflowsDetails.some(workflowDetails => workflowDetails.workflowName === action.workflowName))
        return false;

    if (!Object.values(flowStatuses).some(flowStatus => flowStatus === action.flowStatus))
        return false;

    if (nonActiveWorkflowsDetails.some(workflowDetails => workflowDetails.workflowId === action.workflowId))
    // throw error because we try to modify not-active workflow.
        return false;

    return true;
};

const getActionsToTrigger = (actions, flowsFunctions, childNodesToStart, currentAction) =>
    childNodesToStart.map(child => actions[child.flowDetails.flowName](currentAction.workflowId, currentAction.workflowName, child.flowDetails.flowStatus))
        .map(actionToTrigger => actionToTrigger.flowStatus !== 2 ?
            Cmd.action(actionToTrigger) :
            Cmd.run(flowsFunctions[actionToTrigger.flowName], {
                successActionCreator: () => actionToTrigger,
                // TODO: we are not supporting cancellation of workflows and flows.
                failActionCreator: () => actionToTrigger,
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

export default (actions, flowsFunctions, workflowsDetails) => (state, action) => {
    if (!isActionValid(actions, workflowsDetails, state.nonActiveWorkflowsDetails, action))
        return state;

    const workflowDetailsIndex = workflowsDetails.findIndex(workflow => workflow.workflowName === action.workflowName);

    if (workflowDetailsIndex === -1)
    // the workflow does not exist by the given name in the action.
        return state;

    const workflowDetails = workflowsDetails[workflowDetailsIndex];

    const activeWorkflowDetailsIndex = state.activeWorkflowsDetails.findIndex(activeWorkflow => activeWorkflow.workflowId === action.workflowId);

    if (activeWorkflowDetailsIndex === -1) {
        if (action.flowStatus !== flowStatuses.started)
        // the workflow has not stated yet and the user notify about finished flowStatus that is not the first flowStatus.
            return state;
        if (workflowDetails.head.isJust() && action.flowName !== workflowDetails.head.value().flowDetails.flowName)
        // the user didn't dispatch the first flow in this workflow.
            return state;

        // we need to create this workflow
        const updatedHeadNode = workflowDetails.head.isNothing() ?
            Maybe.Nothing :
            {
                ...workflowDetails.head.value(),
                isCompleted: true,
                completeTime: action.flowStatusCompleteTime
            };
        const newActiveWorkflowDetails = {
            workflowId: action.workflowId,
            workflowName: workflowDetails.workflowName,
            head: duplicateWorkflowGraph(workflowDetails.head, updatedHeadNode),
            workflowStatus: workflowStatuses.started
        };
        return loop(
            {
                ...state,
                activeWorkflowsDetails: [...state.activeWorkflowsDetails, newActiveWorkflowDetails],
            },
            Cmd.list(getActionsToTrigger(actions, flowsFunctions, workflowDetails.head.value().childs, action))
        );
    }

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
        workflowId: action.workflowId,
        head: duplicateWorkflowGraph(activeWorkflowDetails.head, updatedNode),
        workflowStatus: workflowStatuses.started
    };

    // is workflow completed.
    if (isWorkflowCompleted(updatedActiveWorkflowDetails.head)) {
        const completedWorkflow = {
            ...updatedActiveWorkflowDetails,
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
        Cmd.list(getActionsToTrigger(actions, flowsFunctions, uncompletedNodes[completedNodeIndex].childs, action)));
};