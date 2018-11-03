export default flowsNames => flowsNames.reduce((flowsObjUntilNow, flowName) => ({
    ...flowsObjUntilNow,
    [flowName]: (workflowId, workflowName, flowStatus) => ({
        type: (workflowName + '_' + flowName + '_' + flowStatus).toUpperCase(),
        flowName,
        workflowId,
        workflowName,
        flowStatus,
        flowStatusCompleteTime: new Date()
    })
}), {});