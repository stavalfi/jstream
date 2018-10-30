import flowsJson from '../workflows';
import validator from './workflowsValidator';

validator(flowsJson);

const workflowsDetails = flowsJson.workflowsDetails.map(flow => {
    if (typeof flow === 'string' || flow instanceof String)
        return {
            workflowName: flow,
            workflow: [flow]
        };
    if (flow !== null && typeof flow === 'object')
        if (flow.length === 0) {
            console.error('empty workflow in flowsJson.json.');
            return 'empty workflow in flowsJson.json.';
        }
        else
            return {
                workflowName: flow.workflowName,
                workflow: [flow.workflow]
            };
    console.error('illegal workflow:',flow);
    return 'illegal workflow';
});
const flowsNames = flowsJson.flowsNames;

export {flowsNames, workflowsDetails};