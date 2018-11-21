import {updateNodeAsSucceedInGraph} from '../../../src/reducerGraphOperations';
import createReducer from '../../../src/createReducer';
import {startWorkflowAction} from '../../../src/actions';
import {mapIf} from '../../../src/utils';
import readWorkflowsFile from './parser';

const getWorkflowDetailsName = workflowDetails => {
    if (typeof workflowDetails === 'string' || workflowDetails instanceof String)
        return workflowDetails;
    if (workflowDetails !== null && typeof workflowDetails === 'object')
        return workflowDetails.workflowName;

    console.error('bad test parameter (workflowDetails can be string or object)', workflowDetails);
    return 'bad test. (time for non-equality with other values)' + Date.now();
};

function updateWorkflowByMarks(activeWorkflowDetails) {
    const updateGraphBFS = graph => {
        if (graph.length === 0)
            return [];

        // disabling eslint here because the alternative functional solution results in max-call-stack exception.
        /* eslint-disable fp/no-nil, fp/no-mutation, fp/no-let, fp/no-loops, fp/no-mutating-methods */

        let nextNodes = [0];
        const visited = graph.map(() => false);

        while (nextNodes.length > 0) {
            const nodeIndex = nextNodes[nextNodes.length - 1];
            visited[nodeIndex] = true;
            if (graph[nodeIndex].hasOwnProperty('status') && graph[nodeIndex].status === 'succeed')
                graph = updateNodeAsSucceedInGraph(graph, nodeIndex, Date.now());
            nextNodes = [...graph[nodeIndex].childs.filter(i => !visited[i]), ...nextNodes.slice(0, nextNodes.length - 1)];
        }

        /* eslint-enable fp/no-nil, fp/no-mutation, fp/no-let, fp/no-loops, fp/no-mutating-methods */

        return graph;
    };

    // for every x_i that is marked as succeed, then x_i.childs should be marked the same as well recursively.
    const markChildsWithStatusRecursively = graph => {
        const newGraph = graph.slice();

        function update(i) {
            if (i === 0)
                return newGraph;
            if (newGraph[i].hasOwnProperty('status') && newGraph[i].status === 'succeed') {
                // disabling eslint here because mutation is much more
                // faster here then re-creating the array (can be more then 100 times).
                // eslint-disable-next-line fp/no-mutation
                newGraph[i].parents.forEach(parentIndex => newGraph[parentIndex].status = 'succeed');
            }
            return update(i - 1);
        }

        return update(newGraph.length - 1);
    };

    return {
        ...activeWorkflowDetails,
        graph: updateGraphBFS(markChildsWithStatusRecursively(activeWorkflowDetails.graph))
    };
}

const initializeActiveWorkflow = (workflowsDetails, workflowName) => {
    const initialReducerState = {
        activeWorkflowsDetails: [],
        nonActiveWorkflowsDetails: []
    };
    const startAction = startWorkflowAction(workflowName, Date.now(), {});
    const activeWorkflow = createReducer(workflowsDetails)(initialReducerState, startAction)
        .activeWorkflowsDetails.find(workflowDetails => getWorkflowDetailsName(workflowDetails) === workflowName);

    return {
        ...activeWorkflow,
        graph: activeWorkflow.graph.map(
            mapIf(
                node => node.flowDetails.hasOwnProperty('status'),
                node => ({
                    ...node,
                    status: node.flowDetails.status,
                    flowDetails: {
                        flowName: node.flowDetails.flowName,
                        flowStatus: node.flowDetails.flowStatus
                    }
                })
            )
        )
    };
};

export default (json, workflowDetailsWithMarks) => {
    const JsonWithWorkflow = {
        flowsNames: json.flowsNames,
        workflowsDetails: [
            workflowDetailsWithMarks,
            ...json.workflowsDetails.filter(workflowDetails => getWorkflowDetailsName(workflowDetails) !== getWorkflowDetailsName(workflowDetailsWithMarks))
        ]
    };

    const {workflowsDetails} = readWorkflowsFile(JsonWithWorkflow);
    const activeWorkflowDetails = initializeActiveWorkflow(workflowsDetails, getWorkflowDetailsName(workflowDetailsWithMarks));

    return updateWorkflowByMarks(activeWorkflowDetails);
};
