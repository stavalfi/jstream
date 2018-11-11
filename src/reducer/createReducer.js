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
    updateCompletedNodeInGraph,
    findShouldStartNode,
    areAllFlowsCompleted,
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
        .filter(() => !state.activeWorkflowsDetails.some(workflowDetails => workflowDetails.workflowId === action.workflowId))
        .map(workflowDetails => ({
            workflowId: action.workflowId,
            workflowName: workflowDetails.workflowName,
            head: initializeWorkflowGraph(workflowDetails.head, action.startWorkflowTime),
            workflowStatusesHistory: [
                {
                    status: workflowStatuses.started,
                    time: action.startWorkflowTime
                }
            ]
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
        .flatMap(activeWorkflowDetailsIndex =>
            Optional.of(state.activeWorkflowsDetails[activeWorkflowDetailsIndex])
                .flatMap(activeWorkflowDetails =>
                    findShouldStartNode(activeWorkflowDetails.head, action.flowName, action.flowStatus)
                        .map(nodeToSetAsCompleted => updateCompletedNodeInGraph(activeWorkflowDetails.head, nodeToSetAsCompleted, action.flowStatusCompleteTime))
                        .map(({head, nodesToStart}) => {
                            const updatedActiveWorkflowDetails = {
                                ...activeWorkflowDetails,
                                head
                            };
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
                                nodesToStart);
                        })))
        .orElse(state);
};

const completeWorkflow = (state, action) => {
    return getFirstBy(state.activeWorkflowsDetails, activeWorkflow => activeWorkflow.workflowId === action.workflowId)
        .filter(activeWorkflowDetails => areAllFlowsCompleted(activeWorkflowDetails.head))
        .map(activeWorkflowDetails => ({
            ...activeWorkflowDetails,
            workflowStatusesHistory: [
                ...activeWorkflowDetails.workflowStatusesHistory,
                {
                    status: workflowStatuses.completed,
                    time: action.completeWorkflowTime
                }
            ]
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

    const startWorkflowFunction = Optional.ofNullable(functions.workflows)
        .map(workflowsFunctions => workflowsFunctions[updatedActiveWorkflowDetails.workflowName])
        .map(workflowFunctions => workflowFunctions.started);

    const completeWorkflowFunction = Optional.ofNullable(functions.workflows)
        .map(workflowsFunctions => workflowsFunctions[updatedActiveWorkflowDetails.workflowName])
        .map(workflowFunctions => workflowFunctions.completed);

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

const generateNextTriggeredActionsAtMiddle = (oldState, newState, action, functions, updatedActiveWorkflowDetails, nodesToStart) => {
    const isNewActiveWorkflow = !oldState.activeWorkflowsDetails.some(activeWorkflowDetails => activeWorkflowDetails.workflowId === updatedActiveWorkflowDetails.workflowId);

    if (isNewActiveWorkflow)
        return oldState;

    const completeWorkflowFunction = Optional.ofNullable(functions.workflows)
        .map(workflowsFunctions => workflowsFunctions[updatedActiveWorkflowDetails.workflowName])
        .map(workflowFunctions => workflowFunctions.completed);

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

    // if nodesToStart.length===0 it doesn't mean the workflow is completed
    // because it may mean that some nodes WILL be start async later!
    if (areAllFlowsCompleted(updatedActiveWorkflowDetails.head))
        return loop(newState, Cmd.list([completeWorkflowCmd]));

    const actionsToDispatch = nodesToStart.map(child => changeFlowStatusAction(action.workflowId, child.flowDetails.flowName, child.flowDetails.flowStatus))
        .map(actionToTrigger => actionToTrigger.flowStatus !== flowStatuses.selfResolved ?
            Cmd.action(actionToTrigger) :
            Cmd.run(functions.flows[actionToTrigger.flowName].task, {
                successActionCreator: () => actionToTrigger,
                args: [action.workflowId]
            }));

    return loop(newState, Cmd.list(actionsToDispatch));
};