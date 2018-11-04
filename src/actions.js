const START_WORKFLOW = 'START_WORKFLOW';
const CHANGE_FLOW_STATUS = 'CHANGE_FLOW_STATUS';
const COMPLETE_WORKFLOW = 'COMPLETE_WORKFLOW';

const startWorkflowAction = workflowName => ({
    type: START_WORKFLOW,
    workflowId: Date.now() + '',
    workflowName,
    startWorkflowTime: Date.now()
});

const changeFlowStatusAction = (workflowId, flowName, flowStatus) => ({
    type: CHANGE_FLOW_STATUS,
    flowName,
    workflowId,
    flowStatus,
    flowStatusCompleteTime: Date.now()
});

const completeWorkflowAction = workflowId => ({
    type: COMPLETE_WORKFLOW,
    workflowId,
    completeWorkflowTime: Date.now()
});

export {
    START_WORKFLOW,
    CHANGE_FLOW_STATUS,
    COMPLETE_WORKFLOW,
    startWorkflowAction,
    changeFlowStatusAction,
    completeWorkflowAction
};