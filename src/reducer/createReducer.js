import {loop, Cmd} from 'redux-loop';
import Optional from 'optional-js';
import workflowStatuses from '../statuses/workflowStatuses';
import flowStatuses from '../statuses/flowStatuses';
import {
    START_WORKFLOW,
    CHANGE_FLOW_STATUS,
    COMPLETE_WORKFLOW,
    changeFlowStatusAction,
    completeWorkflowAction as completeWorkflowActionCreator
} from '../actions';
import {
    getFirstBy,
    getFirstIndexBy,
} from '../utils';
import {
    initializeWorkflowGraph,
    duplicateGraphWithUpdates,
    getCurrentLeafsOfWorkflowGraph,
    areAllFlowsCompleted,
    getNodeParents
} from './reducerGraphOperations';

const initialState = {activeWorkflowsDetails: [], nonActiveWorkflowsDetails: []};

export default (functions, workflowsDetails) => (state = initialState, action) => {
    switch (action.type) {
        case START_WORKFLOW:
            return startWorkflow(state, action, functions, workflowsDetails);
        case CHANGE_FLOW_STATUS:
            return changeFlowStatus(state, action, functions);
        case COMPLETE_WORKFLOW:
            return completeWorkflow(state, action);
    }
    return state;
};

const startWorkflow = (state, action, functions, workflowsDetails) => {
    return getFirstBy(workflowsDetails, workflow => workflow.workflowName === action.workflowName)
        .filter(() => action.type === START_WORKFLOW)
        .filter(() => !state.activeWorkflowsDetails.some(workflowDetails => workflowDetails.workflowId === action.workflowId))
        .map(workflowDetails => ({
            workflowId: action.workflowId,
            workflowName: workflowDetails.workflowName,
            head: initializeWorkflowGraph(workflowDetails.head),
            workflowStatus: workflowStatuses.started
        }))
        .map(activeWorkflowDetails => {
            const newState = {
                ...state,
                activeWorkflowsDetails: [...state.activeWorkflowsDetails, activeWorkflowDetails],
            };
            return generateNextTriggeredActionsAtStart(state, newState, action, functions, activeWorkflowDetails);
        })
        .orElse(state);
};

const changeFlowStatus = (state, action, functions) => {
    return getFirstIndexBy(state.activeWorkflowsDetails, workflowDetails => workflowDetails.workflowId === workflowDetails.workflowId)
        .flatMap(activeWorkflowDetailsIndex => {
            const activeWorkflowDetails = state.activeWorkflowsDetails[activeWorkflowDetailsIndex];

            // Find the node that is completed in the workflow graph.
            // Then check for every of it's childs, if I should trigger for them an action.
            // The condition is: for every child, if all it's parents are completed, then I need to dispatch that child's action.

            const uncompletedNodes = getCurrentLeafsOfWorkflowGraph(activeWorkflowDetails.head);

            const completedNode = getFirstBy(uncompletedNodes, node => node.flowDetails.flowName === action.flowName && node.flowDetails.flowStatus === action.flowStatus);
            return completedNode
                .map(uncompletedNode => ({
                    ...uncompletedNode,
                    isCompleted: true,
                    completeTime: action.flowStatusCompleteTime
                }))
                .map(updatedNode => ({
                    ...activeWorkflowDetails,
                    head: duplicateGraphWithUpdates(activeWorkflowDetails.head, updatedNode)
                }))
                .map(updatedActiveWorkflowDetails => {
                    const newState = {
                        ...state,
                        activeWorkflowsDetails: [
                            ...state.activeWorkflowsDetails.slice(0, activeWorkflowDetailsIndex),
                            updatedActiveWorkflowDetails,
                            ...state.activeWorkflowsDetails.slice(activeWorkflowDetailsIndex + 1)
                        ]
                    };

                    return generateNextTriggeredActionsAtMiddle(
                        state,
                        newState,
                        action,
                        functions,
                        updatedActiveWorkflowDetails,
                        completedNode.get());
                });
        })
        .orElse(state);
};

const completeWorkflow = (state, action) => {
    return getFirstBy(state.activeWorkflowsDetails, activeWorkflow => activeWorkflow.workflowId === action.workflowId)
        .filter(activeWorkflowDetails => areAllFlowsCompleted(activeWorkflowDetails.head))
        .map(activeWorkflowDetails => ({
            ...activeWorkflowDetails,
            completeTime: action.completeWorkflowTime,
            workflowStatus: workflowStatuses.completed
        }))
        .map(updatedActiveWorkflowDetails => ({
            ...state,
            activeWorkflowsDetails: state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId !== updatedActiveWorkflowDetails.workflowId),
            nonActiveWorkflowsDetails: [...state.nonActiveWorkflowsDetails, updatedActiveWorkflowDetails]
        }))
        .map(newState => loop(newState, Cmd.list([])))
        .orElse(state);
};


/////////////////////////////////
// helper functions
/////////////////////////////////

const generateNextTriggeredActionsAtStart = (oldState, newState, action, functions, updatedActiveWorkflowDetails) => {
    const isNewActiveWorkflow = !oldState.activeWorkflowsDetails.some(activeWorkflowDetails => activeWorkflowDetails.workflowId === updatedActiveWorkflowDetails.workflowId);
    if (!isNewActiveWorkflow)
        return oldState;

    const startWorkflowFunction = Optional.ofNullable(functions.startWorkflowsFunctions)
        .map(startWorkflowsFunctions => startWorkflowsFunctions[updatedActiveWorkflowDetails.workflowName]);

    const completeWorkflowFunction = Optional.ofNullable(functions.completeWorkflowsFunctions)
        .map(completeWorkflowsFunctions => completeWorkflowsFunctions[updatedActiveWorkflowDetails.workflowName]);

    const completeWorkflowAction = completeWorkflowActionCreator(action.workflowId);

    const completeWorkflowCmd = completeWorkflowFunction.map(completeWorkflowFunction =>
        Cmd.run(completeWorkflowFunction, {
            successActionCreator: () => completeWorkflowAction,
            args: [action.workflowId]
        }))
        .orElse(Cmd.action(completeWorkflowAction));

    if (updatedActiveWorkflowDetails.head.isPresent()) {
        const startedActionInFirstFlow = changeFlowStatusAction(action.workflowId, updatedActiveWorkflowDetails.head.get().flowDetails.flowName, flowStatuses.started);
        return startWorkflowFunction.map(startWorkflowFunction =>
            loop(newState, Cmd.list([Cmd.run(startWorkflowFunction, {
                successActionCreator: () => startedActionInFirstFlow,
                args: [action.workflowId]
            })])))
            .orElse(loop(newState, Cmd.list([Cmd.action(startedActionInFirstFlow)])));
    }

    return startWorkflowFunction.map(startWorkflowFunction =>
        loop(newState, Cmd.list([
            Cmd.run(startWorkflowFunction, {args: [action.workflowId]}),
            completeWorkflowCmd
        ])))
        .orElse(loop(newState, Cmd.list([completeWorkflowCmd])));
};

const generateNextTriggeredActionsAtMiddle = (oldState, newState, action, functions, updatedActiveWorkflowDetails, completedNode) => {
    const isNewActiveWorkflow = !oldState.activeWorkflowsDetails.some(activeWorkflowDetails => activeWorkflowDetails.workflowId === updatedActiveWorkflowDetails.workflowId);

    if (isNewActiveWorkflow)
        return oldState;

    const completeWorkflowFunction = Optional.ofNullable(functions.completeWorkflowsFunctions)
        .map(completeWorkflowsFunctions => completeWorkflowsFunctions[updatedActiveWorkflowDetails.workflowName]);

    const completeWorkflowAction = completeWorkflowActionCreator(action.workflowId);

    const completeWorkflowCmd = completeWorkflowFunction.map(completeWorkflowFunction =>
        Cmd.run(completeWorkflowFunction, {
            successActionCreator: () => completeWorkflowAction,
            args: [action.workflowId]
        }))
        .orElse(Cmd.action(completeWorkflowAction));

    // here: head.isPresent() === true. if not, we wouldn't be here
    // because the only dispatch was completeWorkflowAction
    // which is the last dispatch in every workflow.

    if (areAllFlowsCompleted(updatedActiveWorkflowDetails.head))
        return loop(newState, Cmd.list([completeWorkflowCmd]));

    // for every child of the node that we marked as completed,
    // we check that in the NEW graph, all it's parents are marked
    // as completed. if yes, then I trigger that child.
    // if not, I skip that child.
    const actionsToDispatch = completedNode.childs.filter(child => getNodeParents(updatedActiveWorkflowDetails.head, child).every(node => node.isCompleted))
        .map(child => changeFlowStatusAction(action.workflowId, child.flowDetails.flowName, child.flowDetails.flowStatus))
        .map(actionToTrigger => actionToTrigger.flowStatus !== flowStatuses.selfResolved ?
            Cmd.action(actionToTrigger) :
            Cmd.run(functions.flows[actionToTrigger.flowName].task, {
                successActionCreator: () => actionToTrigger,
                args: [action.workflowId]
            }));

    return loop(newState, Cmd.list(actionsToDispatch));
};