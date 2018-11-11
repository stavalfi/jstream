import Optional from 'optional-js';
import activeFlowStatus from '../statuses/activeFlowStatus';
import {getFirstBy} from '../utils';


function initializeWorkflowGraph(head, startWorkflowTime) {
    if (!head.isPresent())
        return head;

    function duplicateNode(node) {
        if (node === head.get())
            return {
                ...node,
                childs: node.childs.map(duplicateNode),
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: startWorkflowTime
                    },
                    {
                        status: activeFlowStatus.shouldStart,
                        time: startWorkflowTime
                    }
                ]
            };
        return {
            ...node,
            childs: node.childs.map(duplicateNode),
            nodeStatusesHistory: [
                {
                    status: activeFlowStatus.notStarted,
                    time: startWorkflowTime
                }
            ]
        };
    }

    return Optional.of(duplicateNode(head.get()));
}

// why we need this function:
// for every child of the node that we marked as completed,
// we check that in the NEW graph, all it's parents are marked
// as completed. if yes, then I trigger that child.
// if not, I skip that child.
// what does it do:
// update node as completed and return the new head and the childs from the updated node that we should dispatch next.
const updateCompletedNodeInGraph = (head, nodeToSetAsCompleted, flowStatusCompleteTime) => {
    if (!head.isPresent())
        return Optional.empty();

    function generateNewGraphWithUpdates(pos, ...nodesToUpdateInGraph) {
        return getFirstBy(nodesToUpdateInGraph, nodeToUpdate => pos.flowDetails === nodeToUpdate.flowDetails)
            .orElse({
                ...pos,
                childs: pos.childs.map(child => generateNewGraphWithUpdates(child, ...nodesToUpdateInGraph))
            });
    }

    const completedNode = {
        ...nodeToSetAsCompleted,
        nodeStatusesHistory: [
            ...nodeToSetAsCompleted.nodeStatusesHistory,
            {
                status: activeFlowStatus.completed,
                time: flowStatusCompleteTime
            }
        ]
    };

    const newHead = generateNewGraphWithUpdates(head.get(), completedNode);

    const areParentsOfChildCompleted = child => getNodeParents(Optional.of(newHead), child)
        .every(node => node.nodeStatusesHistory[node.nodeStatusesHistory.length - 1].status === activeFlowStatus.completed);

    const nodesToStart = completedNode.childs.filter(areParentsOfChildCompleted)
        .filter(child => child.nodeStatusesHistory[child.nodeStatusesHistory.length - 1].status === activeFlowStatus.notStarted)
        .map(shouldStartNode => ({
            ...shouldStartNode,
            nodeStatusesHistory: [
                ...shouldStartNode.nodeStatusesHistory,
                {
                    status: activeFlowStatus.shouldStart,
                    time: flowStatusCompleteTime
                }
            ]
        }));

    return {
        nodesToStart: nodesToStart,
        head: Optional.of(generateNewGraphWithUpdates(newHead, ...nodesToStart))
    };
};

// get all node's parents
// the given node may not be present by reference in the graph so we check this by NODE.id.
const getNodeParents = (head, node) => {
    if (!head.isPresent() || head.get().flowDetails === node.flowDetails)
        return [];

    function search(pos) {
        if (pos.childs.length > 0) {
            // possibleLeaf belong to the graph before the deep-copy so the condition child===possibleLeaf will be false.
            // because child belongs to the deep-copied graph.
            const isNodeAChild = pos.childs.some(child => child.flowDetails === node.flowDetails);
            if (isNodeAChild)
                return [pos];
        }

        // I didn't find the parent yet so we will keep searching.
        if (pos.childs.length === 0)
            return [];

        return pos.childs.flatMap(search);
    }

    return search(head.get());
};

const areAllFlowsCompleted = head => {
    if (!head.isPresent())
        return true;

    function areAllNodesCompleted(node) {
        if (node.nodeStatusesHistory[node.nodeStatusesHistory.length - 1].status !== activeFlowStatus.completed)
            return false;
        if (node.childs.length === 0)
            return true;
        // it's enough to check only one path.
        return areAllNodesCompleted(node.childs[0]);
    }

    return areAllNodesCompleted(head.get());
};

// search from all the nodes that should start, the node with the given flow name and flow status.
const findShouldStartNode = (head, flowName, flowStatus) => {
    if (!head.isPresent())
        return Optional.empty();

    function find(node) {
        if (node.nodeStatusesHistory[node.nodeStatusesHistory.length - 1].status === activeFlowStatus.shouldStart &&
            node.flowDetails.flowName === flowName &&
            node.flowDetails.flowStatus === flowStatus)
            return [node];
        return node.childs.flatMap(find);
    }

    const node = find(head.get());
    return node.length === 0 ? Optional.empty() : Optional.of(node[0]);
};

export {
    initializeWorkflowGraph,
    updateCompletedNodeInGraph,
    findShouldStartNode,
    areAllFlowsCompleted,
    getNodeParents
};