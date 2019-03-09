import {graphByIndexesToObjects, transformToArrayGraph, groupGraphByFlows} from './utils';

export const fixAndExtendGraph = (parsedFlows, extendedParsedFlow, graph, flowName) => {
  const newGraph1 = replaceParsedFlows(parsedFlows, graph, flowName);
  const newGraph2 = extendGraph(parsedFlows, extendedParsedFlow, newGraph1, flowName);
  return newGraph2;
};

function replaceParsedFlows(parsedFlows, graph, flowName) {
  const head = graphByIndexesToObjects(graph);
  const {initialFlowId, flowMembersByFlowId} = groupGraphByFlows(parsedFlows, head);
  const fullFlowMembersByFlowId = replaceFlowMembersByFlowId(
    parsedFlows,
    flowMembersByFlowId,
    flowName,
  );
  const result = transformToArrayGraph(fullFlowMembersByFlowId.get(initialFlowId)[0]);
  return result;
}

function replaceFlowMembersByFlowId(parsedFlows, flowMembersByFlowId, flowName) {
  const flowMembersByFlowIdValues = [...flowMembersByFlowId.values()];
  if (flowMembersByFlowIdValues.length === 1) {
    const flowName = flowMembersByFlowIdValues[0][0].path[0];
    const isFlowParsed = parsedFlows.some(parsedFlow => parsedFlow.name === flowName);
    if (!isFlowParsed) {
      return flowMembersByFlowId;
    }
  }

  const fullFlowMembersByFlowId = new Map();

  [...flowMembersByFlowId.entries()].forEach(([subFlowId, flowMembers]) => {
    const subFlowName = flowMembers[0].path[0];
    const parsedFlow = parsedFlows.find(parsedFlow => parsedFlow.name === subFlowName);
    const shouldSubFlowNameBeAddedToPath = flowName && subFlowName !== flowName;
    const replacedGraph =
      parsedFlow &&
      parsedFlow.graph
        .map(pos => ({
          ...(flowMembers[0].identifier && {identifier: flowMembers[0].identifier}),
          path: shouldSubFlowNameBeAddedToPath ? [flowName, ...pos.path] : pos.path,
          subFlowId: subFlowId,
          children: [],
          parents: [],
        }))
        .map((pos, j, array) => {
          pos.parents = parsedFlow.graph[j].parentsIndexes.map(parentIndex => array[parentIndex]);
          pos.children = parsedFlow.graph[j].childrenIndexes.map(childIndex => array[childIndex]);
          return pos;
        });
    fullFlowMembersByFlowId.set(subFlowId, replacedGraph || flowMembers);
  });

  [...flowMembersByFlowId.entries()].forEach(([subFlowId, flowMembers]) => {
    const subFlowName = flowMembers[0].path[0];
    const shouldSubFlowNameBeAddedToPath = flowName && subFlowName !== flowName;
    const fullFlowMembers = fullFlowMembersByFlowId.get(subFlowId);
    flowMembers.forEach(oldNode => {
      const oldPath = shouldSubFlowNameBeAddedToPath ? [flowName, ...oldNode.path] : oldNode.path;
      const newNode = fullFlowMembers.find(node => arePathsEqual(node.path, oldPath));
      newNode &&
        oldNode.children
          .filter(child => child.subFlowId !== subFlowId)
          .map(child => child.subFlowId)
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
  if (!extendedParsedFlow) {
    return flowMembersByFlowId;
  }
  const fullFlowMembersByFlowId = new Map();

  [...flowMembersByFlowId.entries()].forEach(([subFlowId, flowMembers]) => {
    const nodePathWithoutExtendedFlows = flowMembers[0].path.filter(
      flowName => !isExtendedFlowName(flowName, extendedParsedFlow),
    );
    const identifierObject = flowMembers[0].identifier && {identifier: flowMembers[0].identifier};
    const extendedNodeGraph = extendedParsedFlow.graph
      .map(pos => {
        return {
          ...identifierObject,
          path: [...nodePathWithoutExtendedFlows, ...pos.path],
          subFlowId: subFlowId,
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
    fullFlowMembersByFlowId.set(subFlowId, extendedNodeGraph);
  });

  [...flowMembersByFlowId.entries()].forEach(([subFlowId, flowMembers]) => {
    const fullFlowMembers = fullFlowMembersByFlowId.get(subFlowId);
    flowMembers.forEach(oldNode => {
      const newNode = fullFlowMembers.find(node => arePathsEqual(node.path, oldNode.path));
      oldNode.children
        .filter(child => child.subFlowId !== subFlowId)
        .map(child => child.subFlowId)
        .map(childFlowId => fullFlowMembersByFlowId.get(childFlowId)[0])
        .forEach(newHead => {
          newNode.children.push(newHead);
          newHead.parents.push(newNode);
        });
    });
  });
  return fullFlowMembersByFlowId;
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

function isExtendedFlowName(flowName, extendedParsedFlow) {
  if (!extendedParsedFlow) {
    return false;
  }
  if ((extendedParsedFlow.graph || []).map(node => node.path[0]).includes(flowName)) {
    return true;
  }
  return isExtendedFlowName(flowName, (extendedParsedFlow || {}).extendedParsedFlow);
}
