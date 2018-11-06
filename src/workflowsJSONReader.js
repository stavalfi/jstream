import Maybe from 'maybe';

// Given array of flows with statuses, return a directed graph which represents the given workflow.
const convertWorkflowsToDirectedGraph = workflowArray => {
    if (workflowArray.length === 0)
        return Maybe.Nothing;
    const head = {
        flowDetails: workflowArray[0],
        childs: []
    };

    const peek = stack => stack[stack.length - 1];
    const stack = [head];
    let stacks = [];
    workflowArray.slice(1)
        .map(flowDetails => ({flowDetails, childs: []}))
        .forEach(newNode => {
            if (newNode.flowDetails.flowName !== peek(stack).flowDetails.flowName &&
                newNode.flowDetails.flowStatus === 1) {
                if (stacks.length === 0 || peek(stacks).flowDetails !== peek(stack).flowDetails)
                    stacks.push({
                        flowDetails: peek(stack).flowDetails,
                        stack: []
                    });
                peek(stack).childs.push(newNode);
                stack.push(newNode);
            }
            if (newNode.flowDetails.flowStatus > 1) {
                if (stacks.length > 0 && peek(stack).flowDetails === peek(stacks).flowDetails) {
                    peek(stacks).stack.forEach(node => node.childs.push(newNode));
                    stacks.pop();
                }
                else
                    peek(stack).childs.push(newNode);
                stack.push(newNode);
                if (newNode.flowDetails.flowStatus === 3) {
                    if (stacks.length > 0)
                        peek(stacks).stack.push(newNode);
                    while (stack.length > 0 && peek(stack).flowDetails.flowName === newNode.flowDetails.flowName)
                        stack.pop();
                }
            }
        });
    return Maybe(head);
};

const isExistInFlowsNamesList = (json, flowName) => json.flowsNames.some(originalFlowName => originalFlowName === flowName);

const isFlowNameWithStatus = flow => flow.length > 2 && (flow.slice(flow.length - 2) === '_1' ||
    flow.slice(flow.length - 2) === '_2' ||
    flow.slice(flow.length - 2) === '_3');

function expandFlow(json, workflowName) {
    if (isFlowNameWithStatus(workflowName))
        return [{
            flowName: workflowName.slice(0, workflowName.length - 2),
            flowStatus: Number(workflowName.slice(workflowName.length - 1))
        }];
    if (isExistInFlowsNamesList(json, workflowName))
        return [1, 2, 3].map(number => ({
            flowName: workflowName,
            flowStatus: number
        }));

    const composedWorkflow = json.workflowsDetails.filter(workflowDetails =>
        workflowDetails !== null &&
        typeof workflowDetails === 'object' &&
        workflowDetails.workflowName === workflowName);

    if (composedWorkflow.length !== 1) {
        console.error('there is no composed workflow with a name: ', workflowName);
        return 'there is no composed workflow with a name: ' + workflowName;
    }

    return composedWorkflow[0].workflow.flatMap(workflowName => expandFlow(json, workflowName));
}

const workflowsDetails = json => json.workflowsDetails
    .map(workflowDetails => {
        if (typeof workflowDetails === 'string' || workflowDetails instanceof String)
            return {
                workflowName: workflowDetails,
                workflow: expandFlow(json, workflowDetails)
            };
        if (workflowDetails !== null && typeof workflowDetails === 'object')
            return {
                workflowName: workflowDetails.workflowName,
                workflow: workflowDetails.workflow.flatMap(workflowName => expandFlow(json, workflowName))
            };

        console.error('illegal workflow:', workflowDetails);
        return 'illegal workflow';
    })
    .map(workflowDetails => ({
        workflowName: workflowDetails.workflowName,
        head: convertWorkflowsToDirectedGraph(workflowDetails.workflow)
    }));

const readWorkflowsFile = json => ({
    flowsNames: json.flowsNames,
    workflowsDetails: workflowsDetails(json)
});

export default readWorkflowsFile;