import { parse } from '@parser/index'
import { distractDisplayNameBySplitters, graphNodeToDisplayName } from '@parser/utils'
import { table as printMatrix } from 'table'
import {
  Graph,
  Node,
  ParsedFlow,
  ParsedFlowOptionalFields,
  Path,
  Splitters,
  Configuration,
  UserFlow,
} from '@parser/types'
import { expect as chaiExpect } from 'chai'

type ExpectedFlowGraphNode = { [key1: string]: [number[], number[]] }
export type ExpectedFlow = {
  name?: string
  maxConcurrency?: number // it should be mandatory but we are too lazy to specify it in every test.
  graph: ExpectedFlowGraphNode[]
  defaultNodeIndex?: number
  extendedFlowIndex?: number
  pathsGroups?: (number | string)[][]
}

export const declareFlows = (n: number, path: Path, extendsSplitter: string): ExpectedFlow[] =>
  [...Array(n).keys()].map(
    (i): ExpectedFlow => ({
      name: `${path[0]}${i}`,
      graph: [
        {
          [`${path[0]}${i}${extendsSplitter}${path.slice(1).join(extendsSplitter)}`]: [[], []],
        },
      ],
      maxConcurrency: 1,
      defaultNodeIndex: 0,
    }),
  )

export const createExpected = (
  expectedFlowsArrays: ExpectedFlow[],
  flowsConfig: Required<Configuration<UserFlow>>,
): (Partial<Omit<ParsedFlow, 'id' | 'graph'>> & Pick<ParsedFlow, 'graph'> & ParsedFlowOptionalFields)[] =>
  expectedFlowsArrays.map(flowToParse => ({
    ...flowToParse,
    graph: convertExpectedFlowGraphArray(flowToParse.graph, flowsConfig),
    ...(flowToParse.pathsGroups
      ? { pathsGroups: flowToParse.pathsGroups.map(array => array.map(groupId => `${groupId}`)) }
      : { pathsGroups: undefined }),
  }))

const convertExpectedFlowGraphArray = (
  expectedFlowGraphArray: ExpectedFlowGraphNode[],
  flowsConfig: Required<Configuration<UserFlow>>,
) => {
  return expectedFlowGraphArray.map(node => {
    const displayNode = distractDisplayNameBySplitters(flowsConfig.splitters, Object.keys(node)[0])
    return {
      parentsIndexes: Object.values(node)[0][0],
      childrenIndexes: Object.values(node)[0][1],
      path: displayNode.partialPath,
      ...(displayNode.hasOwnProperty('identifier') && { identifier: displayNode.identifier }),
    }
  })
}

export const createFlows = <T>(
  actualFlowGraph: T,
  flowsConfig: (actualFlowGraph: T) => Required<Configuration<UserFlow>>,
) => parse(flowsConfig(actualFlowGraph)).flows

const compareNodes = (splitters: Splitters) => (node1: Node, node2: Node) => {
  if (node1.path.join(splitters.extends) < node2.path.join(splitters.extends)) {
    return -1
  }
  if (node1.path.join(splitters.extends) > node2.path.join(splitters.extends)) {
    return 1
  }
  return 0
}

function sortGraph(
  graph: Graph,
  splitters = { extends: '_', identifier: '/' },
): {
  oldIndexToNewIndex: { [index: number]: number }
  newGraph: (Node & { displayName: string })[]
} {
  const newGraph = graph
    .map(node => ({
      ...node,
      displayName: graphNodeToDisplayName(splitters)(node),
      originalNode: node,
    }))
    .sort(compareNodes(splitters))

  const oldIndexToNewIndex = graph
    .map((node, oldIndex) => {
      const newIndex = newGraph.findIndex(pos => pos.originalNode === node)
      return { [oldIndex]: newIndex }
    })
    .reduce((acc, obj) => ({ ...acc, ...obj }), {})

  return {
    oldIndexToNewIndex,
    newGraph: newGraph
      .map(node => ({
        ...node,
        childrenIndexes: node.childrenIndexes
          .map(i => oldIndexToNewIndex[i])
          .sort((i, j) => compareNodes(splitters)(newGraph[i], newGraph[j])),
        parentsIndexes: node.parentsIndexes
          .map(i => oldIndexToNewIndex[i])
          .sort((i, j) => compareNodes(splitters)(newGraph[i], newGraph[j])),
      }))
      .map(node => ({
        path: node.path,
        childrenIndexes: node.childrenIndexes,
        parentsIndexes: node.parentsIndexes,
        displayName: node.displayName,
      })),
  }
}

type ParsedFlowWithDisplyName = {
  graph: (Node & { displayName?: string })[]
  pathsGroups?: ParsedFlow['pathsGroups']
} & ParsedFlowOptionalFields

const sortFlow = (flow: ParsedFlowWithDisplyName): ParsedFlowWithDisplyName => {
  const { newGraph, oldIndexToNewIndex } = sortGraph(flow.graph)
  const newPathsGroups = flow.pathsGroups && flow.pathsGroups.map(x => x)
  newPathsGroups &&
    flow.pathsGroups &&
    flow.pathsGroups.forEach(
      (_, i) => flow.pathsGroups && (newPathsGroups[oldIndexToNewIndex[i]] = flow.pathsGroups[i]),
    )

  return {
    ...flow,
    graph: newGraph,
    pathsGroups: newPathsGroups,
    ...('defaultNodeIndex' in flow && { defaultNodeIndex: oldIndexToNewIndex[flow.defaultNodeIndex] }),
  }
}

const sortFlows = (flows: ParsedFlowWithDisplyName[]): ParsedFlowWithDisplyName[] => {
  const withSourceIndexes = flows.map(sortFlow).map((flow, startIndex) => ({
    ...flow,
    startIndex,
    graphAsString: JSON.stringify(flow.graph),
  }))
  const sortedFlows = withSourceIndexes.sort((flow1, flow2) => {
    if (flow1.graphAsString < flow2.graphAsString) {
      return -1
    }
    if (flow1.graphAsString > flow2.graphAsString) {
      return 1
    }
    return 0
  })
  const oldToNewIndex = sortedFlows
    .map((flow, newIndex) => ({ [flow.startIndex]: newIndex }))
    .reduce((acc, x) => ({ ...acc, ...x }), {})

  return sortedFlows
    .map(flow => {
      delete flow.startIndex
      delete flow.graphAsString
      return flow
    })
    .map(flow => ({
      ...flow,
      ...('extendedFlowIndex' in flow && { extendedFlowIndex: oldToNewIndex[flow.extendedFlowIndex] }),
    }))
}

export function assertEqualFlows(
  expectedFlowsArray1: ParsedFlowWithDisplyName[],
  actualFlowsArray1: ParsedFlowWithDisplyName[],
  count = 0,
) {
  const expectedFlowsArray = sortFlows(expectedFlowsArray1)
  const actualFlowsArray = sortFlows(actualFlowsArray1)

  if (count > 1) {
    return
  }
  expectedFlowsArray.forEach((expectedFlow, i) => {
    const actualFlow = findFlowByFlow(actualFlowsArray, expectedFlow)
    const errorMessage = `${count === 0 ? 'expected' : 'actual'} flow: ${
      'name' in expectedFlow ? expectedFlow.name : '__NO_NAME__'
    } - does not exist: \n${flowToString(expectedFlow)} \n${graphToString(expectedFlow.graph)}
        \n\ngood guess that this is the ${count === 0 ? 'actual' : 'expected'} graph (same index):
        \n${flowToString(actualFlowsArray[i])} \n${graphToString((actualFlow || actualFlowsArray[i]).graph)}`
    chaiExpect(actualFlow, errorMessage).not.undefined
    if (actualFlow) {
      chaiExpect(actualFlow.graph, errorMessage).deep.equal(expectedFlow.graph)
      if ('defaultNodeIndex' in expectedFlow) {
        chaiExpect('defaultNodeIndex' in actualFlow, errorMessage).deep.equal(true)
        // @ts-ignore   -> i have expect in the previous line.
        chaiExpect(actualFlow.defaultNodeIndex, errorMessage).deep.equal(expectedFlow.defaultNodeIndex)
      }
      if (count === 0 && expectedFlow.pathsGroups) {
        assertPathsGroupsEqual(expectedFlow, actualFlow, count)
      }
      if (count === 0 && 'extendedFlowIndex' in expectedFlow) {
        const expectedExtendedFlow = expectedFlowsArray[expectedFlow.extendedFlowIndex as number]
        chaiExpect('extendedFlowIndex' in actualFlow, errorMessage).deep.equal(true)
        // @ts-ignore   -> i have expect in the previous line.
        const actualExtendedFlow = actualFlowsArray[actualFlow.extendedFlowIndex as number]

        const isEqual =
          // @ts-ignore
          expectedExtendedFlow.name === actualExtendedFlow.name &&
          // @ts-ignore
          expectedExtendedFlow.defaultNodeIndex === actualExtendedFlow.defaultNodeIndex &&
          graphToString(expectedExtendedFlow.graph) === graphToString(actualExtendedFlow.graph)
        chaiExpect(
          isEqual,
          // @ts-ignore
          `${count === 0 ? 'expected' : 'actual'} flow: ${expectedFlow.name} - has different extended flow`,
        ).deep.equal(true)
      }
    }
  })

  assertEqualFlows(actualFlowsArray1, expectedFlowsArray1, count + 1)
}

function assertPathsGroupsEqual(
  expectedFlow: ParsedFlowWithDisplyName,
  actualFlow: ParsedFlowWithDisplyName,
  count: number,
) {
  if (count > 1) {
    return
  }
  const expectedFlow1: ParsedFlowWithDisplyName = count === 0 ? expectedFlow : actualFlow
  const actualFlow1: ParsedFlowWithDisplyName = count === 0 ? actualFlow : expectedFlow
  const expected = expectedFlow1.pathsGroups
  const actual = actualFlow1.pathsGroups
  if (expected) {
    chaiExpect(
      Boolean(actual),
      // @ts-ignore
      `(${'name' in expectedFlow1 ? expectedFlow1.name : '__NO_FLOW_NAME_'}) ${
        count === 0 ? 'expected' : 'actual'
      } flow should have pathsGroups but it doesn't have`,
    ).deep.equal(true)
    if (actual) {
      const expectedArray = expected.flatMap(x => x)
      const actualArray = actual.flatMap(x => x)
      const differentGroupsInExpected = Array.from(new Set(expectedArray))
      for (const expectedGroupId of differentGroupsInExpected) {
        const indexesWithSameValueInExpected = expectedArray.reduce(
          (acc: number[], groupId, i) => (groupId === expectedGroupId ? [i, ...acc] : acc),
          [],
        )
        const errorMessage = `expected pathsGroups is different then actual pathsGroups.\n\nexpected: (every line is different array. left side= index 0)\n${
          // @ts-ignore
          'name' in expectedFlow1 ? expectedFlow1.name : '__NO_FLOW_NAME_'
        }\n${table(expected)}\nactual:\n${table(actual)}\n`

        const actualValues = actualArray.filter((_, i) => indexesWithSameValueInExpected.includes(i))
        chaiExpect(Array.from(new Set(actualValues)).length === 1, errorMessage).deep.equal(true)
      }
    }
  }
  assertPathsGroupsEqual(actualFlow1, expectedFlow1, count + 1)
}

function findFlowByFlow(flowsArray: ParsedFlowWithDisplyName[], flowToSearch: ParsedFlowWithDisplyName) {
  return flowsArray.find(flow => {
    const stringToFind = graphToString(flowToSearch.graph)
    const stringNow = graphToString(flow.graph)
    return (
      ('name' in flow && 'name' in flowToSearch && flow.name === flowToSearch.name) ||
      // @ts-ignore
      (flow.defaultNodeIndex === flowToSearch.defaultNodeIndex && stringNow === stringToFind)
    )
  })
}

function flowToString(flow: ParsedFlowWithDisplyName) {
  let str = ''
  if ('name' in flow) {
    str += `name: ${flow.name}\n`
  }
  if ('extendedFlowIndex' in flow) {
    str += `extendedFlowIndex: ${flow.extendedFlowIndex}\n`
  }
  if ('defaultNodeIndex' in flow) {
    str += `defaultNodeIndex: ${flow.defaultNodeIndex}`
  }
  return str
}

export function graphToString(sortedGraph: (Node & { displayName?: string })[]) {
  // i === row number
  // j === column number
  // [i][j] === edge from i to j
  const matrix = [false, ...sortedGraph].map(() => [false, ...sortedGraph].map(() => ' '))
  sortedGraph
    .map(node => node.displayName)
    .forEach((displayName, i) => {
      matrix[i + 1][0] = displayName as string
      matrix[0][i + 1] = displayName as string
    })
  sortedGraph.forEach((node, i) => {
    node.childrenIndexes.forEach(j => (matrix[i + 1][j + 1] = 'T'))
  })
  sortedGraph.forEach((node, i) => {
    node.childrenIndexes.forEach(j => (matrix[i + 1][0] = node.displayName as string))
  })
  return table(matrix)
}

// ensure matrix have a consistent number of cells before printing it using `table` lib.
function table(matrix: any[]) {
  const maxLength = matrix.reduce((max, array) => (array.length > max ? array.length : max), 0)
  const fixedMatrix = matrix.map(array =>
    array.length < maxLength
      ? array.concat(Array.from(new Array(maxLength - array.length).keys()).map(() => ''))
      : array,
  )
  return printMatrix(fixedMatrix)
}
