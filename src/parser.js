import {flowStatus} from "./statuses";

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

const parseWorkflowsDetails = json => json.workflowsDetails
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
        return 'illegal workflow: ' + workflowDetails;
    })
    .map(workflowDetails => ({
        workflowName: workflowDetails.workflowName,
        graph: convertArrayToGraph(workflowDetails.workflow)
    }));

const convertArrayToGraph = flowDetailsArray => {
    return flowDetailsArray.map((flowDetails, i) => ({
        flowDetails,
        childs: findChilds(flowDetailsArray, i),
        parents: findParents(flowDetailsArray, i),
        nodeId: Date.now() + ''
    }));
};

const findParents = (flowDetailsArray, indexOfFlowDetails) => {
    if (indexOfFlowDetails === 0)
        return [];

    if (flowDetailsArray[indexOfFlowDetails].flowStatus !== flowStatus.started &&
        flowDetailsArray[indexOfFlowDetails].flowName === flowDetailsArray[indexOfFlowDetails - 1].flowName &&
        flowDetailsArray[indexOfFlowDetails].flowStatus - 1 === flowDetailsArray[indexOfFlowDetails - 1].flowStatus)
        return [indexOfFlowDetails - 1];

    if (flowDetailsArray[indexOfFlowDetails].flowStatus !== flowStatus.started) {
        return [...Array(indexOfFlowDetails).keys()]
            .map(i => indexOfFlowDetails - 1 - i)
            .reduce(({result, shouldStop}, i) => {
                if (shouldStop)
                    return {result, shouldStop};
                if (flowDetailsArray[indexOfFlowDetails].flowName === flowDetailsArray[i].flowName &&
                    flowDetailsArray[indexOfFlowDetails].flowStatus - 1 === flowDetailsArray[i].flowStatus)
                    if (result.length === 0)
                        return {result: [i], shouldStop: true};
                    else
                        return {result, shouldStop: true};
                if (flowDetailsArray[i].flowStatus === flowStatus.completed)
                    return {result: [...result, i], shouldStop};
                return {result, shouldStop};
            }, {result: [], shouldStop: false}).result;
    }

    // note: there is only one child that we can find.

    // flowDetailsArray: [...,a_i,...,b1,...,b2,...,b3,...,c1,...,c2,...,c3,...,a_i+1,...]
    // where b1 (or c1) is the given node and i===1 or i===2.
    // we need to return a_i.

    for (let i = indexOfFlowDetails - 1; i >= 0; i--) {
        if (flowDetailsArray[i].flowStatus !== flowStatus.completed)
            return [i];
        const flowToSkip = flowDetailsArray[i];
        // if the given node is c1, then skip b3,b2,b1 (hold in b1)
        // and in the next iteration of the loop, come to a_i.
        while (flowDetailsArray[i].flowName !== flowToSkip.flowName || flowDetailsArray[i].flowStatus !== flowStatus.started)
            i--;
    }
};

const findChilds = (flowDetailsArray, indexOfFlowDetails) => {
    if (indexOfFlowDetails === flowDetailsArray.length - 1)
        return [];

    if (flowDetailsArray[indexOfFlowDetails].flowStatus !== flowStatus.completed) {
        return flowDetailsArray.reduce(({result, shouldStop}, flowDetails, i) => {
            if (shouldStop)
                return {result, shouldStop};
            if (flowDetailsArray[indexOfFlowDetails].flowName === flowDetails.flowName &&
                flowDetailsArray[indexOfFlowDetails].flowStatus + 1 === flowDetails.flowStatus)
                if (result.length === 0)
                    return {result: [i], shouldStop: true};
                else
                    return {result, shouldStop: true};
            if (indexOfFlowDetails < i &&
                flowDetails.flowStatus === flowStatus.started)
                return {result: [...result, i], shouldStop};
            return {result, shouldStop};
        }, {result: [], shouldStop: false}).result
    }

    // note: there is only one child that we can find.

    // algorithm:
    // find xxx_started node of this flow.
    // it's parent's next status's node is the node we are looking for.

    const startedNodeIndex = [...Array(indexOfFlowDetails).keys()]
        .map(i => indexOfFlowDetails - 1 - i)
        .find(i => flowDetailsArray[i].flowName === flowDetailsArray[indexOfFlowDetails].flowName &&
            flowDetailsArray[i].flowName === flowStatus.started);

    if (startedNodeIndex === 0) {
        // flowDetailsArray: [x1,....,x2,...,x3] where x3 is the given node.
        // it means that x3 doesn't have childs.
        return [];
    }

    // flowDetailsArray: [...,y_i,...,x1,...,x2,...,x3,...,a1,...,a2,...,a3,...,y_i+1,...]
    // where x3 is the given node and i===1 or i===2.
    // we need to return y_i+1.

    for (let i = indexOfFlowDetails + 1; i < flowDetailsArray.length; i++) {
        if (flowDetailsArray[i].flowStatus !== flowStatus.started)
            return [i];
        const flowToSkip = flowDetailsArray[i];
        // if the given node is x1, then skip a1,a2,a3 (hold in a3)
        // and in the next iteration of the loop, come to y_i+1.
        while (flowDetailsArray[i].flowName !== flowToSkip.flowName || flowDetailsArray[i].flowStatus !== flowStatus.completed)
            i++;
    }
};

const readWorkflowsFile = json => ({
    flowsNames: json.flowsNames,
    workflowsDetails: parseWorkflowsDetails(json)
});

export default readWorkflowsFile;

export {
    findChilds,
    findParents,
    convertArrayToGraph,
    parseWorkflowsDetails,
    expandFlow,
    isFlowNameWithStatus,
    isExistInFlowsNamesList
};