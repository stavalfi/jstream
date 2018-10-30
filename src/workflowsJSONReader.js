import flowsJson from "../workflows";
import validator from "./workflowsValidator";

validator(flowsJson);

const workflowsDetails = flowsJson.workflowsDetails.map(flow => {
    // if (flow === null)
    //     throw Error("there is a null inside flowsJson.json.");
    if (typeof flow === 'string' || flow instanceof String)
        return {
            workflowName: flow,
            workflow: [flow]
        };
    if (flow !== null && typeof flow === 'object')
        if (flow.length === 0)
            throw Error("empty workflow in flowsJson.json.");
        else
            return {
                workflowName: flow.workflowName,
                workflow: [flow.workflow]
            };
    throw Error("illegal workflow: " + flow);
});
const flowsNames = flowsJson.flowsNames;

export {flowsNames, workflowsDetails};