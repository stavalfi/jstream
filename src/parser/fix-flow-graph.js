import {graphByIndexesToObjects, transformToArrayGraph, groupGraphByFlows} from './utils';

export const fixAndExtendGraph = (parsedFlows, extendedParsedFlow, graph) => {
  const newGraph1 = replaceParsedFlows(parsedFlows, graph);
  const newGraph2 = extendGraph(parsedFlows, extendedParsedFlow, newGraph1);
  return newGraph2;
};

function replaceParsedFlows(parsedFlows, graph) {
  if (parsedFlows.length === 0) {
    return graph;
  }
  const head = graphByIndexesToObjects(graph);
  const {initialFlowId, flowMembersByFlowId} = groupGraphByFlows(parsedFlows, head);
  const fullFlowMembersByFlowId = replaceFlowMembersByFlowId(parsedFlows, flowMembersByFlowId);
  const result = transformToArrayGraph(fullFlowMembersByFlowId.get(initialFlowId)[0]);
  return result;
}

function replaceFlowMembersByFlowId(parsedFlows, flowMembersByFlowId) {
  const flowMembersByFlowIdValues = [...flowMembersByFlowId.values()];
  if (flowMembersByFlowIdValues.length === 1) {
    const flowName = flowMembersByFlowIdValues[0][0].path[0];
    const isFlowParsed = parsedFlows.some(parsedFlow => parsedFlow.name === flowName);
    if (!isFlowParsed) {
      return flowMembersByFlowId;
    }
  }

  const fullFlowMembersByFlowId = new Map();

  [...flowMembersByFlowId.entries()].forEach(([flowId, flowMembers]) => {
    const flowName = flowMembers[0].path[0];
    const parsedFlow = parsedFlows.find(parsedFlow => parsedFlow.name === flowName);
    const replacedGraph =
      parsedFlow &&
      parsedFlow.graph
        .map(pos => ({
          ...(flowMembers[0].identifier && {identifier: flowMembers[0].identifier}),
          path: pos.path,
          flowId: flowId,
          children: [],
          parents: [],
        }))
        .map((pos, j, array) => {
          pos.parents = parsedFlow.graph[j].parentsIndexes.map(parentIndex => array[parentIndex]);
          pos.children = parsedFlow.graph[j].childrenIndexes.map(childIndex => array[childIndex]);
          return pos;
        });
    fullFlowMembersByFlowId.set(flowId, replacedGraph || flowMembers);
  });

  [...flowMembersByFlowId.entries()].forEach(([flowId, flowMembers]) => {
    const flowName = flowMembers[0].path[0];
    const parsedFlow = parsedFlows.find(parsedFlow => parsedFlow.name === flowName);
    const isFlowNameInPath = parsedFlow.graph.some(node => node.path[0] === flowName);
    const fullFlowMembers = fullFlowMembersByFlowId.get(flowId);
    flowMembers.forEach(oldNode => {
      const oldPath = isFlowNameInPath ? oldNode.path : oldNode.path.slice(1);
      const newNode = fullFlowMembers.find(node => arePathsEqual(node.path, oldPath));
      newNode &&
        oldNode.children
          .filter(child => child.flowId !== flowId)
          .map(child => child.flowId)
          .map(childFlowId => fullFlowMembersByFlowId.get(childFlowId)[0])
          .forEach(newHead => {
            newNode.children.push(newHead);
            newHead.parents.push(newNode);
          });
    });
  });
  return fullFlowMembersByFlowId;
}

function extendGraph(parsedFlows, extendedParsedFlow, graph) {
  if (!extendedParsedFlow) {
    return graph;
  }
  const head = graphByIndexesToObjects(graph);
  const {initialFlowId, flowMembersByFlowId} = groupGraphByFlows(parsedFlows, head);
  const fullFlowMembersByFlowId = extendFlowMembersByFlowId(
    extendedParsedFlow,
    flowMembersByFlowId,
  );
  const result = transformToArrayGraph(fullFlowMembersByFlowId.get(initialFlowId)[0]);
  return result;
}

function extendFlowMembersByFlowId(extendedParsedFlow, flowMembersByFlowId) {
  const fullFlowMembersByFlowId = new Map();

  [...flowMembersByFlowId.entries()].forEach(([flowId, flowMembers]) => {
    const nodePathWithoutExtendedFlows = flowMembers[0].path.filter(
      flowName => !isExtendedFlowName(flowName, extendedParsedFlow),
    );
    const identifierObject = flowMembers[0].identifier && {identifier: flowMembers[0].identifier};
    const extendedNodeGraph = extendedParsedFlow.graph
      .map(pos => {
        return {
          ...identifierObject,
          path: [...nodePathWithoutExtendedFlows, ...pos.path],
          flowId: flowId,
          children: [],
          parents: [],
        };
      })
      .map((pos, j, array) => {
        pos.parents = extendedParsedFlow.graph[j].parentsIndexes.map(
          parentIndex => array[parentIndex],
        );
        pos.children = extendedParsedFlow.graph[j].childrenIndexes.map(
          childIndex => array[childIndex],
        );
        return pos;
      });
    fullFlowMembersByFlowId.set(flowId, extendedNodeGraph);
  });

  [...flowMembersByFlowId.entries()].forEach(([flowId, flowMembers]) => {
    const fullFlowMembers = fullFlowMembersByFlowId.get(flowId);
    flowMembers.forEach(oldNode => {
      const newNode = fullFlowMembers.find(node => arePathsEqual(node.path, oldNode.path));
      oldNode.children
        .filter(child => child.flowId !== flowId)
        .map(child => child.flowId)
        .map(childFlowId => fullFlowMembersByFlowId.get(childFlowId)[0])
        .forEach(newHead => {
          newNode.children.push(newHead);
          newHead.parents.push(newNode);
        });
    });
  });
  return fullFlowMembersByFlowId;
}

function replaceNodesToParsedGraphs(parsedFlows, oldGraph) {
  let head;
  oldGraph
    .map((node, i) => {
      const identifierObject = pos.identifier && {identifier: pos.identifier};
      const newNode = {children: [], parents: [], path: node.path, ...identifierObject};
      if (i === 0) {
        head = newNode;
      }
      return newNode;
    })
    .forEach((node, i) => {
      oldGraph[i].parentsIndexes.forEach(j => node.parents.push(oldGraph[j]));
      oldGraph[i].childrenIndexes.forEach(j => node.children.push(oldGraph[j]));
    });

  function fixNode(node) {
    fixAllNodesOfSpecificFlow(parsedFlows, node);

    // find all the sub-children of this node that are not on the same flow and fix them.
    const visited = new Map();
    const stack = [node];
    const nodesOnDifferentFlow = [];
    while (stack.length > 0) {
      const pos = stack.pop();
      visited.set(pos, true);
      if (areNodesOnSameFlow(parsedFlows, pos, node)) {
        nodesOnDifferentFlow.push(pos);
      } else {
        pos.children.filter(child => !visited.get(child)).forEach(child => stack.push(child));
      }
    }

    nodesOnDifferentFlow.forEach(fixNode);
  }

  fixNode(head);

  return transformToArrayGraph(head);
}

function fixAllNodesOfSpecificFlow(parsedFlows, newNode) {
  // find node by path. start search from newNode .
  function findNodeByPath(path) {
    function find(pos) {
      if (arePathsEqual(path, pos.path)) {
        return pos;
      }
      return pos.children.filter(child => child.path[0] === path[0]).find(find);
    }

    return find(newNode);
  }

  const parsedFlow = parsedFlows.find(parsedFlow => parsedFlow.name === newNode.path[0]);
  parsedFlow.graph
    .map(node => {
      const nodeFromNewGraph = findNodeByPath(node.path);
      const identifierObject = node.identifier && {identifier: node.identifier};
      return {
        hasCopyInNewGraph: Boolean(nodeFromNewGraph),
        nodeFromParsedFlowGraph: nodeFromNewGraph,
        originalNode: node,
        nodeInNewGraph: {path: node.path, ...identifierObject},
      };
    })
    .forEach((node, i, array) => {
      node.nodeInNewGraph.children = node.originalNode.childrenIndexes.map(
        j => array[j].nodeInNewGraph,
      );
      node.nodeInNewGraph.parents = node.originalNode.parentsIndexes.map(
        j => array[j].nodeInNewGraph,
      );
      if (node.hasCopyInNewGraph) {
        const extraChildren = node.nodeFromParsedFlowGraph.children.filter(
          child => !areNodesOnSameFlow(parsedFlows, node, child),
        );
        node.nodeInNewGraph.children = node.nodeInNewGraph.children.concat(extraChildren);
        const extraParents = node.nodeFromParsedFlowGraph.parents.filter(
          parent => !areNodesOnSameFlow(parsedFlows, parent, node),
        );
        node.nodeInNewGraph.parents = node.nodeInNewGraph.parents.concat(extraParents);
      }
    });
}

export const arePathsEqual = (path1, path2) => {
  if (path1.length !== path2.length) {
    return false;
  }
  for (let i = 0; i < path1.length; i++)
    if (path1[i] !== path2[i]) {
      return false;
    }
  return true;
};

// we add extendedPath to nodePath. we only add the elements in extendedPath that are missing in nodePath.
// we add the missing elements to the end of nodePath.
function mergePaths(nodePath, extendedPath) {
  const firstExtendedFlowIndex = nodePath.findIndex(flowName => extendedPath.includes(flowName));
  if (firstExtendedFlowIndex === -1) {
    return [...nodePath, ...extendedPath];
  } else {
    const firstExtendedFlowIndexInExtendedPath = extendedPath.findIndex(
      flowName => flowName === nodePath[firstExtendedFlowIndex],
    );
    const missingFlowNamesBeforeFirst = extendedPath.slice(0, firstExtendedFlowIndexInExtendedPath);
    const result = mergePaths(
      nodePath.slice(firstExtendedFlowIndex + 1),
      extendedPath.slice(firstExtendedFlowIndexInExtendedPath + 1),
    );
    const updatedNodePath = [
      ...nodePath.slice(0, firstExtendedFlowIndex),
      ...missingFlowNamesBeforeFirst,
      nodePath[firstExtendedFlowIndex],
      ...result,
    ];
    return updatedNodePath;
  }
}

function isExtendedFlowName(flowName, extendedParsedFlow) {
  if (!extendedParsedFlow) {
    return false;
  }
  if ((extendedParsedFlow.graph || []).map(node => node.path[0]).includes(flowName)) {
    return true;
  }
  return isExtendedFlowName(flowName, (extendedParsedFlow || {}).extendedParsedFlow);
}
