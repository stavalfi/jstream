import {activeFlowStatus} from './statuses';
import {mapIf} from './utils';

const getNodeActiveStatus = node => node.nodeStatusesHistory[node.nodeStatusesHistory.length - 1].status;

const updateNodeAsSucceedInGraph = (graph, nodeIndexToSetAsCompleted, flowStatusCompleteTime) =>
    graph.map(mapIf(
        (node, i, graph) => i === nodeIndexToSetAsCompleted &&
            getNodeActiveStatus(node) === activeFlowStatus.shouldStart &&
            node.parents.every(parent => getNodeActiveStatus(graph[parent]) === activeFlowStatus.succeed),
        node => ({
            ...node,
            nodeStatusesHistory: [
                ...node.nodeStatusesHistory,
                {
                    status: activeFlowStatus.succeed,
                    time: flowStatusCompleteTime
                }
            ]
        })))
        .map(mapIf(
            (node, i, graph) => graph[nodeIndexToSetAsCompleted].childs.includes(i) && getNodeActiveStatus(node) === activeFlowStatus.notStarted && node.parents.every(parent => getNodeActiveStatus(graph[parent]) === activeFlowStatus.succeed),
            node => ({
                ...node,
                nodeStatusesHistory: [
                    ...node.nodeStatusesHistory,
                    {
                        status: activeFlowStatus.shouldStart,
                        time: flowStatusCompleteTime
                    }
                ]
            })
        ));

export {
    getNodeActiveStatus,
    updateNodeAsSucceedInGraph
};