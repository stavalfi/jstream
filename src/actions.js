import {activeFlowStatus, flowStatus} from './statuses';
import {getNodeActiveStatus} from './reducerGraphOperations';

// action constants

const START_WORKFLOW = 'START_WORKFLOW';
const CHANGE_FLOW_STATUS = 'CHANGE_FLOW_STATUS';
const COMPLETE_WORKFLOW = 'COMPLETE_WORKFLOW';
const CANCEL_WORKFLOW = 'CANCEL_WORKFLOW';

const startWorkflowAction = (workflowName, startWorkflowTime, userCustomParamsObject) => ({
    type: workflowName.toUpperCase() + '_' + START_WORKFLOW,
    generalType: START_WORKFLOW,
    workflowId: Date.now() + '',
    workflowName,
    time: startWorkflowTime,
    userCustomParamsObject
});

const getKeyByValue = (object, value) => Object.keys(object).find(key => object[key] === value);

// sync action creators

const changeFlowStatusToSelfResolvedAction = (workflowId, flowName, flowStatusCompleteTime, flowFunction) => ({
    type: flowName.toUpperCase() + '_' + CHANGE_FLOW_STATUS + '_' + getKeyByValue(flowStatus, flowStatus.selfResolved).toUpperCase(),
    generalType: CHANGE_FLOW_STATUS,
    flowName,
    workflowId,
    flowStatus: flowStatus.selfResolved,
    flowFunction,
    time: flowStatusCompleteTime
});

const changeFlowStatusAction = (workflowId, flowName, flowStatusCompleteTime, flowStatusValue) => ({
    type: flowName.toUpperCase() + '_' + CHANGE_FLOW_STATUS + '_' + getKeyByValue(flowStatus, flowStatusValue).toUpperCase(),
    generalType: CHANGE_FLOW_STATUS,
    flowName,
    workflowId,
    flowStatus: flowStatusValue,
    time: flowStatusCompleteTime
});

const completeWorkflowAction = (workflowId, workflowName, completeWorkflowTime) => ({
    type: workflowName.toUpperCase() + '_' + COMPLETE_WORKFLOW,
    generalType: COMPLETE_WORKFLOW,
    workflowId,
    workflowName,
    time: completeWorkflowTime
});

// dispatch all flows in the given workflow (I assume the workflow has started but not completed).
const generateActionsToDispatch = (workflowId, activeWorkflowsDetails, flowsFunctions, currentDispatchesTime) => {
    const activeWorkflowDetailsIndex = activeWorkflowsDetails.findIndex(activeWorkflowDetails => activeWorkflowDetails.workflowId === workflowId);

    const workflowStatus = workflowDetails => workflowDetails.workflowStatusesHistory[workflowDetails.workflowStatusesHistory.length - 1].status;
    if (activeWorkflowDetailsIndex === -1 ||
        workflowStatus(activeWorkflowsDetails[activeWorkflowDetailsIndex]) === workflowStatus.completed)
        return [];

    const updatedActiveWorkflowDetails = activeWorkflowsDetails[activeWorkflowDetailsIndex];
    const graph = updatedActiveWorkflowDetails.graph;

    // note: if nodesToStart.length===0 it doesn't mean the workflow is succeed
    // because it may mean that some nodes WILL be start async later!
    if (graph.every(node => getNodeActiveStatus(node) === activeFlowStatus.succeed))
        return [];

    // I need to find all nodes that needs to be dispatched.
    const actionsToDispatch = graph.filter(node => getNodeActiveStatus(node) === activeFlowStatus.shouldStart)
        .map(node => node.flowDetails.flowStatus === flowStatus.selfResolved ?
            changeFlowStatusToSelfResolvedAction(workflowId, node.flowDetails.flowName, currentDispatchesTime, flowsFunctions[node.flowDetails.flowName].task) :
            changeFlowStatusAction(workflowId, node.flowDetails.flowName, currentDispatchesTime, node.flowDetails.flowStatus));

    return actionsToDispatch;
};

// async action creators

// it operates like BFS algorithm.
const createRunWorkflowAction = (stateSelector, functions) => (workflowName, userCustomParamsObject) => (dispatch, getState) => {
    const startAction = startWorkflowAction(workflowName, Date.now(), userCustomParamsObject);

    function dispatchNextLayer(lastState, lastActions, newState) {
        if (newState === lastState)
            return lastActions;

        const actionsToDispatch = generateActionsToDispatch(
            startAction.workflowId,
            newState.activeWorkflowsDetails,
            functions.flows,
            Date.now()
        );

        return dispatchNextLayer(newState, dispatch(actionsToDispatch), stateSelector(getState()));
    }

    // start workflow and dispatch all actions in the workflow (dispatch all flows in this workflow).
    dispatchNextLayer(stateSelector(getState()), [dispatch(startAction)], stateSelector(getState()));

    // all nodes in workflow completed so complete workflow.
    const completeAction = completeWorkflowAction(startAction.workflowId, startAction.workflowName, Date.now());

    return dispatch(completeAction);
};

export {
    START_WORKFLOW,
    CHANGE_FLOW_STATUS,
    COMPLETE_WORKFLOW,
    CANCEL_WORKFLOW,
    startWorkflowAction,
    changeFlowStatusToSelfResolvedAction,
    changeFlowStatusAction,
    completeWorkflowAction,
    generateActionsToDispatch,
    createRunWorkflowAction
};