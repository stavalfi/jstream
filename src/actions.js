import flowsJson from '../workflows';

export default flowsJson.flowsNames.reduce((flowsObjUntilNow, flowName) => ({
    ...flowsObjUntilNow,
    [flowName]: (workflowId, workflowName, flowStatus) => ({
        type: 'COMPLETED_STATUS',
        flowName,
        workflowId,
        workflowName,
        flowStatus,
        flowStatusCompleteTime: new Date()
    })
}), {});