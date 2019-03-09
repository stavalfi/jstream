import {parse} from '../../src/parser';
import '../';
import {distractDisplayNameBySplitters, graphNodeToDisplayName} from '../../src/parser/utils';
import {table} from 'table';
import deepEqual from 'deep-equal';



export const declareFlows = (n, path, extendsSplitter) =>
  [...Array(n).keys()].map(i => ({
    name: `${path[0]}${i}`,
    graph: [
      {
        [`${path[0]}${i}${extendsSplitter}${path.slice(1).join(extendsSplitter)}`]: [[], []],
      },
    ],
  }));

export const createExpected = (expectedFlowsArrays, flowsConfig) => {
  return expectedFlowsArrays.map(flowToParse => ({
    ...(flowToParse.hasOwnProperty('name') && {name: flowToParse.name}),
    ...(flowToParse.hasOwnProperty('defaultFlowName') && {
      defaultFlowName: flowToParse.defaultFlowName,
    }),
    graph: convertExpectedFlowGraphArray(flowToParse.graph, flowsConfig),
  }));
};

const convertExpectedFlowGraphArray = (expectedFlowGraphArray, flowsConfig) => {
  return expectedFlowGraphArray.map(node => {
    const {partialPath, identifier} = distractDisplayNameBySplitters(
      flowsConfig.splitters,
      Object.keys(node)[0],
    );
    return {
      parentsIndexes: Object.values(node)[0][0],
      childrenIndexes: Object.values(node)[0][1],
      path: partialPath,
      ...(identifier && {identifier}), // todo: replace with hasOwnProperty
    };
  });
};

export const createFlows = (actualFlowGraph, flowsConfig) =>
  parse(flowsConfig(actualFlowGraph)).flows;

export const createWorkflows = (actualFlowGraph, flowsConfig) =>
  parse(flowsConfig(actualFlowGraph)).workflows;

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
  const nodes = sortedGraph.map(node => ({
    path: node.path,
    ...(node.hasOwnProperty('identifier') && {identifier: node.identifier}),
  }));
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
  sortedGraph.forEach((node, i) => {
    node.childrenIndexes.forEach(j => (matrix[i + 1][0] = node.displayName));
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
  if (count > 1) {
    return;
  }
  expectedFlowsArray.forEach((expectedFlow, i) => {
    const actualFlow = findFlowByFlow(actualFlowsArray, expectedFlow);
    expect(
      actualFlow,
      `${count === 0 ? 'expected' : 'actual'} flow: ${
        expectedFlow.name
      } - does not exist: \n${graphToString(expectedFlow.graph)}
        \n\n good guess that this is the ${count === 0 ? 'actual' : 'expected'} graph (same index):
        \n${graphToString(actualFlowsArray[i].graph)}`,
    ).toBeDefined();
  });

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
