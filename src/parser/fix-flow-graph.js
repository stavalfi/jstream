import {arePathsEqual} from './utils';

export function fixAndExtendGraph({parsedFlows, flowToParse, parsedGraph, extendedParsedFlow}) {
  if (
    parsedGraph.length === 1 &&
    parsedGraph[0].path.length === 1 &&
    parsedGraph[0].path[0] === flowToParse.name
  ) {
    if (extendedParsedFlow) {
      return extendedParsedFlow.graph.map(node => ({
        ...node,
        path: [flowToParse.name, ...node.path],
      }));
    } else {
      return parsedGraph;
    }
  }

  const copiedParsedGraph = parsedGraph.map(node => ({...node}));

  const differentFlowNames = copiedParsedGraph.reduce(
    ({acc, groupIndex}, node, i) => {
      const flowName = getUsedFlowName(flowToParse)(node.path);
      if (i === 0 || acc[groupIndex - 1] !== flowName) {
        node.groupIndex = groupIndex;
        return {acc: [...acc, flowName], groupIndex: groupIndex + 1};
      } else {
        node.groupIndex = groupIndex - 1;
        return {acc, groupIndex};
      }
    },
    {acc: [], groupIndex: 0},
  ).acc;

  if (
    differentFlowNames.length === 1 &&
    extendedParsedFlow &&
    differentFlowNames[0] === extendedParsedFlow.name
  ) {
    return extendedParsedFlow.graph.map(node => ({
      ...node,
      path: [flowToParse.name, ...node.path],
    }));
  }

  const extendedFlowsInGraphByFlowName = differentFlowNames
    .map(flowName => parsedFlows.find(parsedFlow => parsedFlow.name === flowName))
    .map(parsedFlow => ({
      ...parsedFlow,
      graph: parsedFlow.graph.map(addFlowName(flowToParse)),
    }))
    .map(parsedFlow => ({
      ...parsedFlow,
      graph: graphByIndexesToObjects(parsedFlow.graph),
    }))
    .map(parsedFlow => extendGraph(extendedParsedFlow)(parsedFlow));

  const getNewNode = (groupIndex, oldNode) => {
    const newGraph = extendedFlowsInGraphByFlowName[groupIndex];
    return newGraph.find(node => arePathsEqual(node.path, oldNode.path));
  };

  for (const oldNode of copiedParsedGraph) {
    const flowNameNode = getUsedFlowName(flowToParse)(oldNode.path);
    const newNode = getNewNode(oldNode.groupIndex, oldNode);
    oldNode.childrenIndexes
      .map(i => copiedParsedGraph[i])
      .forEach(oldChid => {
        const flowNameChild = getUsedFlowName(flowToParse)(oldChid.path);
        if (flowNameNode === flowNameChild) {
          const newChild = getNewNode(oldChid.groupIndex, oldChid);
          if (!newNode.children.includes(newChild)) {
            newNode.children.push(newChild);
            newChild.parents.push(newNode);
          }
        } else {
          const headOfNewChildGraph = extendedFlowsInGraphByFlowName[oldChid.groupIndex][0];
          if (!newNode.children.includes(headOfNewChildGraph)) {
            newNode.children.push(headOfNewChildGraph);
            headOfNewChildGraph.parents.push(newNode);
          }
        }
      });
  }

  const newGraph = transformToArrayGraph(
    extendedFlowsInGraphByFlowName[copiedParsedGraph[0].groupIndex][0],
  );
  return newGraph;
}

const getUsedFlowName = flowToParse => path => {
  if (path.length > 1) {
    if (flowToParse.hasOwnProperty('name')) {
      return path[1];
    } else {
      return path[0];
    }
  } else {
    return path[0];
  }
};

const addFlowName = flowToParse => node =>
  flowToParse.hasOwnProperty('name') ? {...node, path: [flowToParse.name, ...node.path]} : node;

const extendGraph = extendedParsedFlow => parsedFlow => {
  if (!extendedParsedFlow) {
    return parsedFlow.graph;
  }
  if (parsedFlow.extendedParsedFlow && parsedFlow.extendedParsedFlow.id === extendedParsedFlow.id) {
    return parsedFlow.graph;
  }

  const oldToExtended = new Map();

  for (const oldNode of parsedFlow.graph) {
    const extendedFlowMember = extendedParsedFlow.graph
      .map(pos => ({
        path: [...oldNode.path, ...pos.path],
        children: [],
        parents: [],
      }))
      .map((pos, j, array) => {
        pos.parents = extendedParsedFlow.graph[j].parentsIndexes.map(
          parentIndex => array[parentIndex],
        );
        pos.children = extendedParsedFlow.graph[j].childrenIndexes.map(
          childIndex => array[childIndex],
        );
        return pos;
      });
    oldToExtended.set(oldNode, extendedFlowMember);
  }

  for (const oldNode of parsedFlow.graph) {
    const newNode = oldToExtended.get(oldNode)[extendedParsedFlow.defaultNodeIndex];
    oldNode.children
      .map(oldChild => oldToExtended.get(oldChild))
      .filter(Boolean)
      .map(extended => extended[0])
      .forEach(newChild => {
        newNode.children.push(newChild);
        newChild.parents.push(newNode);
      });
  }

  // put new graph in array
  const newGraph = [];
  const visited = new Map();
  let stack = [oldToExtended.get(parsedFlow.graph[0])[0]];
  while (stack.length > 0) {
    const newNode = stack.pop();
    if (!visited.get(newNode)) {
      visited.set(newNode, true);
      newGraph.push(newNode);
      stack = [...newNode.children, ...stack];
    }
  }

  return newGraph;
};

function graphByIndexesToObjects(graph) {
  const extendedNodeGraph = graph
    .map(pos => {
      const subFlowIdObject = pos.subFlowId && {subFlowId: pos.subFlowId};
      const identifierObject = pos.identifier && {identifier: pos.identifier};
      return {
        ...identifierObject,
        path: pos.path,
        ...subFlowIdObject,
        children: [],
        parents: [],
      };
    })
    .map((pos, j, array) => {
      pos.parents = graph[j].parentsIndexes.map(parentIndex => array[parentIndex]);
      pos.children = graph[j].childrenIndexes.map(childIndex => array[childIndex]);
      return pos;
    });

  return extendedNodeGraph;
}

function transformToArrayGraph(head) {
  const visited = new Map();
  const graph = [];
  let i = 0;

  function addIndexes(pos) {
    if (!visited.get(pos)) {
      visited.set(pos, true);
      graph.push(pos);
      pos.index = i++;
      pos.children.filter(child => !visited.get(child)).forEach(child => addIndexes(child));
    }
  }

  addIndexes(head);

  return graph.map(node => {
    const identifierObject = node.identifier && {identifier: node.identifier};
    return {
      ...identifierObject,
      path: node.path,
      childrenIndexes: node.children.map(child => child.index),
      parentsIndexes: node.parents.map(parent => parent.index),
    };
  });
}
