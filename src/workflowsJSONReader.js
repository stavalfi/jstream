import flowsJson from '../workflows';
import validator from './workflowsValidator';

validator(flowsJson);

const isExistInFlowsNamesList = flowName => flowsJson.flowsNames.some(originalFlowName => originalFlowName === flowName);

const isFlowNameWithStatus = flow => flow.length > 2 && (flow.slice(flow.length - 2) === '_1' ||
    flow.slice(flow.length - 2) === '_2' ||
    flow.slice(flow.length - 2) === '_3');

function expandFlow(workflowName) {
    if (isFlowNameWithStatus(workflowName))
        return [workflowName];
    if (isExistInFlowsNamesList(workflowName))
        return [1, 2, 3].map(number => workflowName + '_' + number);

    const composedWorkflow = flowsJson.workflowsDetails.filter(workflowDetails =>
        workflowDetails !== null &&
        typeof workflowDetails === 'object' &&
        workflowDetails.workflowName === workflowName);

    if (composedWorkflow.length !== 1) {
        console.error('there is no composed workflow with a name: ', workflowName);
        return 'there is no composed workflow with a name: ' + workflowName;
    }

    return composedWorkflow[0].workflow.flatMap(expandFlow);
}


const workflowsDetails = flowsJson.workflowsDetails.map(flow => {
    if (typeof flow === 'string' || flow instanceof String) {
        if (isExistInFlowsNamesList(flow))
            return {
                workflowName: flow,
                workflow: [flow].flatMap(expandFlow)
            };
        console.error('there is no such flow', flow, ', please choose a different way to represent your flow.');
        return 'there is no such flow ' + flow + ', please choose a different way to represent your flow.';
    }
    if (flow !== null && typeof flow === 'object')
        return {
            workflowName: flow.workflowName,
            workflow: flow.workflow.flatMap(expandFlow)
        };

    console.error('illegal workflow:', flow);
    return 'illegal workflow';
});


const flowsNames = flowsJson.flowsNames;

export {flowsNames, workflowsDetails};