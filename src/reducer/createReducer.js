import {loop, Cmd} from 'redux-loop';
import Optional from 'optional-js';
import workflowStatuses from '../statuses/workflowStatuses';
import flowStatuses from '../statuses/flowStatuses';
import {
    START_WORKFLOW,
    CHANGE_FLOW_STATUS,
    COMPLETE_WORKFLOW,
    CANCEL_WORKFLOW,
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
    findAllLatestCompletedNodesInCanceledFlows,
    cancelAllNotCompletedNodes
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
        case CANCEL_WORKFLOW:
            return cancelWorkflow(state, action, functions);
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
            return generateNextTriggeredActionsAfterWorkflowStarted(state, newState, action, functions, activeWorkflowDetails);
        })
        .orElse(state);
};

const changeFlowStatus = (state, action, functions) => {
    const getWorkflowStatus = workflow => workflow.workflowStatusesHistory[workflow.workflowStatusesHistory.length - 1].status;
    return getFirstIndexBy(state.activeWorkflowsDetails, workflowDetails => workflowDetails.workflowId === workflowDetails.workflowId)
        .flatMap(activeWorkflowDetailsIndex =>
            Optional.of(state.activeWorkflowsDetails[activeWorkflowDetailsIndex])
                .filter(activeWorkflowDetails => getWorkflowStatus(activeWorkflowDetails) === workflowStatuses.started)
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

                            return generateNextTriggeredActionsAfterNodeCompleted(
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
    const getWorkflowStatus = workflow => workflow.workflowStatusesHistory[workflow.workflowStatusesHistory.length - 1].status;
    return getFirstBy(state.activeWorkflowsDetails, activeWorkflow => activeWorkflow.workflowId === action.workflowId)
        .filter(activeWorkflowDetails => getWorkflowStatus(activeWorkflowDetails) === workflowStatuses.started)
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

const cancelWorkflow = (state, action, functions) => {
    const getWorkflowStatus = workflow => workflow.workflowStatusesHistory[workflow.workflowStatusesHistory.length - 1].status;
    return getFirstBy(state.activeWorkflowsDetails, workflowDetails => workflowDetails.workflowId === workflowDetails.workflowId)
        .filter(activeWorkflowDetails => getWorkflowStatus(activeWorkflowDetails) === workflowStatuses.started)
        .map(activeWorkflowDetails => ({
            ...activeWorkflowDetails,
            head: cancelAllNotCompletedNodes(activeWorkflowDetails.head, action.cancelWorkflowTime),
            workflowStatusesHistory: [
                ...activeWorkflowDetails.workflowStatusesHistory,
                {
                    status: workflowStatuses.canceled,
                    time: action.cancelWorkflowTime
                }
            ]
        }))
        .map(updatedActiveWorkflowDetails => {
            const newState = {
                ...state,
                activeWorkflowsDetails: state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId !== updatedActiveWorkflowDetails.workflowId),
                nonActiveWorkflowsDetails: [...state.nonActiveWorkflowsDetails, updatedActiveWorkflowDetails]
            };
            return generateNextDispatchedActionsAfterCancel(state, newState, action, functions, updatedActiveWorkflowDetails);
        })
        .orElse(state);
};

/////////////////////////////////
// helper functions
/////////////////////////////////

const generateNextTriggeredActionsAfterWorkflowStarted = (oldState, newState, action, functions, updatedActiveWorkflowDetails) => {
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
            args: [action.workflowId],
            forceSync: true
        }))
        .orElse(Cmd.action(completeWorkflowAction));

    if (updatedActiveWorkflowDetails.head.isPresent()) {
        const startedActionInFirstFlow = changeFlowStatusAction(action.workflowId, updatedActiveWorkflowDetails.head.get().flowDetails.flowName, flowStatuses.started);
        return startWorkflowFunction.map(startWorkflowFunction =>
            loop(newState, Cmd.list([Cmd.run(startWorkflowFunction, {
                successActionCreator: () => startedActionInFirstFlow,
                args: [action.workflowId],
                forceSync: true
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

const generateNextTriggeredActionsAfterNodeCompleted = (oldState, newState, action, functions, updatedActiveWorkflowDetails, nodesToStart) => {
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
            args: [action.workflowId],
            forceSync: true
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
                args: [action.workflowId],
                forceSync: true
            }));

    return loop(newState, Cmd.list(actionsToDispatch));
};

const generateNextDispatchedActionsAfterCancel = (state, newState, action, functions, activeWorkflowDetails) => {
    const getCancellationFunction = flowDetails =>
        Optional.ofNullable(functions.flows[flowDetails.flowName].cancellation)
            .map(cancellationFunctions =>
                flowDetails.status === flowStatuses.started ?
                    cancellationFunctions.beforeSelfResolved :
                    cancellationFunctions.beforeCompleted);

    const workflowCancellationFunction = Optional.ofNullable(functions.workflows[activeWorkflowDetails.workflowName].cancellation)
        .map(cancellationFunction => [Cmd.run(cancellationFunction, {
            args: [action.workflowId]
        })])
        .orElse([]);

    const latestCompletedNodes = findAllLatestCompletedNodesInCanceledFlows(activeWorkflowDetails.head);
    const cancellationFunctionsToRun = latestCompletedNodes.map(node => node.flowDetails)
        .filter(flowDetails => getCancellationFunction(flowDetails).isPresent())
        .map(flowDetails => Cmd.run(getCancellationFunction(flowDetails).get(), {
            args: [action.workflowId]
        }));

    return loop(newState, Cmd.list([
        ...cancellationFunctionsToRun,
        ...workflowCancellationFunction
    ]));
};