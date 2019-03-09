import {parse} from '../../src/parser';
import '../';
import {
  distractDisplayNameBySplitters,
  graphNodeToDisplayName,
  groupGraphByFlows,
  graphByIndexesToObjects,
} from '../../src/parser/utils';
import {table} from 'table';
import deepEqual from 'deep-equal';

export const declareFlows = (n, path, extendsSplitter) =>
  [...Array(n).keys()].map(i => ({
    name: `${path[0]}${i}`,
    graph: [{[`${path[0]}${i}${extendsSplitter}${path.slice(1).join(extendsSplitter)}`]: [[], []]}],
  }));

export const createTestFlows = (expectedFlowsArrays, flowsConfig) => {
  return expectedFlowsArrays.map(flowToParse => ({
    ...(flowToParse.name && {name: flowToParse.name}),
    ...(flowToParse.defaultFlowName && {
      defaultFlowName: flowToParse.defaultFlowName,
    }),
    graph: convertExpectedFlowArray(flowToParse.graph, flowsConfig),
  }));
};

const convertExpectedFlowArray = (expectedFlowArray, flowsConfig) => {
  return expectedFlowArray.map(node => {
    const {partialPath, identifier} = distractDisplayNameBySplitters(
      flowsConfig.splitters,
      Object.keys(node)[0],
    );
    const identifierObject = identifier && {identifier};
    return {
      parentsIndexes: Object.values(node)[0][0],
      childrenIndexes: Object.values(node)[0][1],
      path: partialPath,
      ...identifierObject,
    };
  });
};

export const createFlows = (actualFlowGraph, flowsConfig) =>
  parse(flowsConfig(actualFlowGraph)).flows;

function graphToMatrix(graph) {
  const sortedGraph = sortGraph(graph);

  // i === row number
  // j === column number
  // [i][j] === edge from i to j
  const childrenMatrix = sortedGraph.map(() => sortedGraph.map(() => false));
  sortedGraph.forEach((node, i) => {
    node.childrenIndexes.forEach(j => (childrenMatrix[i][j] = true));
  });
  const parentsMatrix = sortedGraph.map(() => sortedGraph.map(() => false));
  sortedGraph.forEach((node, i) => {
    node.parentsIndexes.forEach(j => (parentsMatrix[i][j] = true));
  });
  const nodes = sortedGraph.map(node => {
    const identifierObject = node.identifier && {identifier: node.identifier};
    return {
      path: node.path,
      ...identifierObject,
    };
  });
  return {
    nodes,
    parentsMatrix,
    childrenMatrix,
  };
}

function sortGraph(graph, splitters = {extends: '_', identifier: '/'}) {
  const newGraph = graph
    .map(node => {
      node.displayName = graphNodeToDisplayName(splitters)(node);
      return node;
    })
    .sort(compareNodes(splitters));

  const oldIndexToNewIndex = graph
    .map((node, oldIndex) => {
      const newIndex = newGraph.findIndex(pos => pos === node);
      return {[oldIndex]: newIndex};
    })
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return newGraph.map(node => ({
    ...node,
    childrenIndexes: node.childrenIndexes
      .map(i => oldIndexToNewIndex[i])
      .sort((i, j) => compareNodes(splitters)(newGraph[i], newGraph[j])),
    parentsIndexes: node.parentsIndexes
      .map(i => oldIndexToNewIndex[i])
      .sort((i, j) => compareNodes(splitters)(newGraph[i], newGraph[j])),
  }));
}

export function graphToString(graph, splitters) {
  const sortedGraph = sortGraph(graph, splitters);

  // i === row number
  // j === column number
  // [i][j] === edge from i to j
  const matrix = [false, ...sortedGraph].map(() => [false, ...sortedGraph].map(() => ' '));
  sortedGraph
    .map(node => node.displayName)
    .forEach((displayName, i) => {
      matrix[i + 1][0] = displayName;
      matrix[0][i + 1] = displayName;
    });
  sortedGraph.forEach((node, i) => {
    node.childrenIndexes.forEach(j => (matrix[i + 1][j + 1] = 'T'));
  });
  return table(matrix);
}

const compareNodes = splitters => (node1, node2) => {
  if (node1.identifier < node2.identifier) {
    return -1;
  }
  if (node1.identifier > node2.identifier) {
    return 1;
  }
  if (node1.path.join(splitters.extends) < node2.path.join(splitters.extends)) {
    return -1;
  }
  if (node1.path.join(splitters.extends) > node2.path.join(splitters.extends)) {
    return 1;
  }
  return 0;
};

export function assertEqualFlows(expectedFlowsArray, actualFlowsArray, count = 0) {
  expectedFlowsArray = expectedFlowsArray.map(flow => ({
    ...flow,
    graph: sortGraph(flow.graph).map(node => {
      if (node.hasOwnProperty('flowId')) {
        delete node.flowId;
      }
      return node;
    }),
  }));
  actualFlowsArray = actualFlowsArray.map(flow => ({
    ...flow,
    graph: sortGraph(flow.graph).map(node => {
      if (node.hasOwnProperty('flowId')) {
        delete node.flowId;
      }
      return node;
    }),
  }));
  if (count > 1) {
    return;
  }
  for (const expectedFlow of expectedFlowsArray) {
    const expectedHead = graphByIndexesToObjects(expectedFlow.graph);
    const {flowMembersByFlowId: expectedFlowMembersByFlowId} = groupGraphByFlows(
      expectedFlowsArray,
      expectedHead,
    );
    const actualFlow = findFlowByFlow(actualFlowsArray, expectedFlow);
    expect(actualFlow, `flow: ${expectedFlow.name} - does not exist.`).toBeDefined();
    const {flowMembersByFlowId: actualFlowMembersByFlowId} = groupGraphByFlows(
      actualFlowsArray,
      graphByIndexesToObjects(actualFlow.graph),
    );
    expect(
      actualFlowMembersByFlowId,
      `flow: ${expectedFlow.name} - flows-members do not match.`,
    ).toEqual(expectedFlowMembersByFlowId);

    expect(expectedFlow.name, `flow: ${expectedFlow.name} - names do not match.`).toEqual(
      actualFlow.name,
    );
    expect(
      expectedFlow.defaultFlowName,
      `flow: ${expectedFlow.name} - default-flow-names do not match.`,
    ).toEqual(actualFlow.defaultFlowName);

    const actualMatrix = graphToMatrix(actualFlow.graph);
    const expectedMatrix = graphToMatrix(expectedFlow.graph);

    expect(
      actualMatrix,
      `flow: ${expectedFlow.name} - graphs do not match. \n
    expected-graph:\n${graphToString(expectedFlow.graph)} \n\n
    actual-graph:\n${graphToString(actualFlow.graph)}`,
    ).toEqual(expectedMatrix);
  }
  assertEqualFlows(actualFlowsArray, expectedFlowsArray, count + 1);
}

function findFlowByFlow(flowsArray, flowToSearch) {
  return flowsArray.find(
    flow =>
      flow.name === flowToSearch.name &&
      flow.defaultFlowName === flowToSearch.defaultFlowName &&
      deepEqual(graphToMatrix(flow.graph), graphToMatrix(flowToSearch.graph)),
  );
}
