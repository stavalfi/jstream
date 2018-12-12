import {flowStatus, nodeStatus} from './statuses';
import {mapIf} from './utils';

const getNodeActiveStatus = node => node.nodeStatusesHistory[node.nodeStatusesHistory.length - 1].status;

const updateNodeAsSucceedInGraph = (graph, nodeIndexToSetAsCompleted, action) =>
    graph.map(mapIf(
        (node, i) => i === nodeIndexToSetAsCompleted &&
            node.flowStatus === flowStatus.selfResolved,
        node => ({
            ...node,
            result: action.flowFunctionResult
        })))
        .map(mapIf(
            (node, i, graph) => i === nodeIndexToSetAsCompleted &&
                getNodeActiveStatus(node) === nodeStatus.shouldStart &&
                node.parents.every(parent => getNodeActiveStatus(graph[parent]) === nodeStatus.succeed),
            node => ({
                ...node,
                nodeStatusesHistory: [
                    ...node.nodeStatusesHistory,
                    {
                        status: nodeStatus.succeed,
                        time: action.time
                    }
                ]
            })))
        .map(mapIf(
            (node, i, graph) => graph[nodeIndexToSetAsCompleted].childs.includes(i) && getNodeActiveStatus(node) === nodeStatus.notStarted && node.parents.every(parent => getNodeActiveStatus(graph[parent]) === nodeStatus.succeed),
            node => ({
                ...node,
                nodeStatusesHistory: [
                    ...node.nodeStatusesHistory,
                    {
                        status: nodeStatus.shouldStart,
                        time: action.time
                    }
                ]
            })
        ));

export {
    getNodeActiveStatus,
    updateNodeAsSucceedInGraph
};