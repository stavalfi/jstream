const START_WORKFLOW = 'START_WORKFLOW';
const START_FLOW = 'START_FLOW';

const workflowActionCreator = workflowName => ({
    type: START_WORKFLOW,
    workflowId: Date.now() + '',
    workflowName,
    startWorkflowTime: Date.now()
});

const flowActionCreator = (workflowId, flowName, flowStatus) => ({
    type: START_FLOW,
    flowName,
    workflowId,
    flowStatus,
    flowStatusCompleteTime: Date.now()
});

export {START_WORKFLOW, START_FLOW, workflowActionCreator, flowActionCreator};