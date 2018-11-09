import Optional from 'optional-js';

function initializeWorkflowGraph(head) {
    if (!head.isPresent())
        return head;

    function duplicateNode(node) {
        return {
            ...node,
            childs: node.childs.map(duplicateNode),
            isCompleted: false
        };
    }

    const newHead = duplicateNode(head.get());
    return Optional.of(newHead);
}

const duplicateGraphWithUpdates = (head, ...updatedNodes) => {
    if (!head.isPresent())
        return head;

    function generatedUpdatedParents(head, updatedNode) {
        if (head.flowDetails === updatedNode.flowDetails)
            return updatedNode;

        return getNodeParents(Optional.of(head), updatedNode)
            .map((_, i) => i)
            .reduce((newHead, i) => {
                const oldParent = getNodeParents(Optional.of(newHead), updatedNode)[i];
                const nodeIndex = oldParent.childs.findIndex(child => child.flowDetails === updatedNode.flowDetails);
                const newParent = {
                    ...oldParent,
                    childs: [...oldParent.childs.slice(0, nodeIndex), updatedNode, ...oldParent.childs.slice(nodeIndex + 1)]
                };
                return generatedUpdatedParents(newHead, newParent);
            }, head);
    }

    const newHead = updatedNodes.reduce((newHead, updatedNode) => generatedUpdatedParents(newHead, updatedNode), head.get());
    return Optional.of(newHead);
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

// return an array of all closest nodes to head that are not completed but their parent is completed.
const getCurrentLeafsOfWorkflowGraph = head => {
    if (!head.isPresent())
        return [];

    function findLeafs(node) {
        if (!node.isCompleted)
            return [node];
        return node.childs.flatMap(findLeafs);
    }

    // I may receive nodes such as node3: {node1: completed, node2: not completed } -> {node3: not completed}
    // so I should get only [node2] and not [node2,node3].
    const possibleLeafs = findLeafs(head.get());

    return possibleLeafs.filter(leaf => getNodeParents(head, leaf).every(node => node.isCompleted));
};

const areAllFlowsCompleted = head => {
    if (!head.isPresent())
        return true;

    function areAllNodesCompleted(node) {
        if (!node.isCompleted)
            return false;
        if (node.childs.length === 0)
            return true;
        // it's enough to check only one path.
        return areAllNodesCompleted(node.childs[0]);
    }

    return areAllNodesCompleted(head.get());
};

export {
    initializeWorkflowGraph,
    duplicateGraphWithUpdates,
    getCurrentLeafsOfWorkflowGraph,
    areAllFlowsCompleted,
    getNodeParents
};