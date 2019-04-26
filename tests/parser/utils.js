import {parse} from '../../src/parser';
import '../';
import {distractDisplayNameBySplitters, graphNodeToDisplayName} from '../../src/parser/utils';
import {table} from 'table';

export const declareFlows = (n, path, extendsSplitter) =>
  [...Array(n).keys()].map(i => ({
    name: `${path[0]}${i}`,
    graph: [
      {
        [`${path[0]}${i}${extendsSplitter}${path.slice(1).join(extendsSplitter)}`]: [[], []],
      },
    ],
    defaultNodeIndex: 0,
  }));

export const createExpected = (expectedFlowsArrays, flowsConfig) => {
  return expectedFlowsArrays.map(flowToParse => ({
    ...flowToParse,
    graph: convertExpectedFlowGraphArray(flowToParse.graph, flowsConfig),
  }));
};

const convertExpectedFlowGraphArray = (expectedFlowGraphArray, flowsConfig) => {
  return expectedFlowGraphArray.map(node => {
    const displayNode = distractDisplayNameBySplitters(flowsConfig.splitters, Object.keys(node)[0]);
    return {
      parentsIndexes: Object.values(node)[0][0],
      childrenIndexes: Object.values(node)[0][1],
      path: displayNode.partialPath,
      ...(displayNode.hasOwnProperty('identifier') && {identifier: displayNode.identifier}),
    };
  });
};

export const createFlows = (actualFlowGraph, flowsConfig) =>
  parse(flowsConfig(actualFlowGraph)).flows;

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

export function assertEqualFlows(expectedFlowsArray, actualFlowsArray, count = 0) {
  expectedFlowsArray = expectedFlowsArray.map(flow => ({
    ...flow,
    graph: sortGraph(flow.graph),
  }));
  actualFlowsArray = actualFlowsArray.map(flow => ({
    ...flow,
    graph: sortGraph(flow.graph),
  }));
  if (count > 1) {
    return;
  }
  expectedFlowsArray.forEach((expectedFlow, i) => {
    const actualFlow = findFlowByFlow(actualFlowsArray, expectedFlow);
    const errorMessage = `${count === 0 ? 'expected' : 'actual'} flow: ${
      expectedFlow.name
    } - does not exist: \n${flowToString(expectedFlow)} \n${graphToString(expectedFlow.graph)}
        \n\ngood guess that this is the ${count === 0 ? 'actual' : 'expected'} graph (same index):
        \n${flowToString(actualFlowsArray[i])} \n${graphToString(actualFlowsArray[i].graph)}`;
    expect(actualFlow, errorMessage).toBeDefined();
    expect(actualFlow.graph, errorMessage).toEqual(expectedFlow.graph);
    expect(actualFlow.defaultNodeIndex, errorMessage).toEqual(expectedFlow.defaultNodeIndex);
    if (count === 0 && expectedFlow.hasOwnProperty('extendedFlowIndex')) {
      const expectedExtendedFlow = expectedFlowsArray[expectedFlow.extendedFlowIndex];
      const actualExtendedFlow = actualFlowsArray[actualFlow.extendedFlowIndex];
      const isEqual =
        expectedExtendedFlow.name === actualExtendedFlow.name &&
        expectedExtendedFlow.defaultNodeIndex === actualExtendedFlow.defaultNodeIndex &&
        graphToString(expectedExtendedFlow.graph) === graphToString(actualExtendedFlow.graph);
      expect(
        isEqual,
        `${count === 0 ? 'expected' : 'actual'} flow: ${
          expectedFlow.name
        } - has different extended flow`,
      ).toBe(true);
    }
  });

  assertEqualFlows(actualFlowsArray, expectedFlowsArray, count + 1);
}

function findFlowByFlow(flowsArray, flowToSearch) {
  return flowsArray.find(flow => {
    return (
      (flow.hasOwnProperty('name') &&
        flowToSearch.hasOwnProperty('name') &&
        flow.name === flowToSearch.name) ||
      (flow.defaultNodeIndex === flowToSearch.defaultNodeIndex &&
        graphToString(flow.graph) === graphToString(flowToSearch.graph))
    );
  });
}

function flowToString(flow) {
  let str = '';
  if (flow.hasOwnProperty('name')) {
    str += 'name: ' + flow.name + '\n';
  }
  if (flow.hasOwnProperty('extendedFlowIndex')) {
    str += 'extendedFlowIndex: ' + flow.extendedFlowIndex + '\n';
  }
  if (flow.hasOwnProperty('defaultNodeIndex')) {
    str += 'defaultNodeIndex: ' + flow.defaultNodeIndex;
  }
  return str;
}

export function graphToString(graph) {
  // i === row number
  // j === column number
  // [i][j] === edge from i to j
  const matrix = [false, ...graph].map(() => [false, ...graph].map(() => ' '));
  graph
    .map(node => node.displayName)
    .forEach((displayName, i) => {
      matrix[i + 1][0] = displayName;
      matrix[0][i + 1] = displayName;
    });
  graph.forEach((node, i) => {
    node.childrenIndexes.forEach(j => (matrix[i + 1][j + 1] = 'T'));
  });
  graph.forEach((node, i) => {
    node.childrenIndexes.forEach(j => (matrix[i + 1][0] = node.displayName));
  });
  return table(matrix);
}
