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
import { Combinations, uuid } from '@jstream/utils'
import deepEqual from 'fast-deep-equal'

type ExpectedFlowGraphNode = { [key1: string]: [number[], number[]] }
export type ExpectedFlow = {
  graph: ExpectedFlowGraphNode[]
} & Combinations<{
  name: string
  maxConcurrency: number
  defaultNodeIndex: number
  extendedFlowIndex: number
  pathsGroups: (number | string)[][]
}>

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

export type ExpectedParsedFlow = Omit<ParsedFlow, 'id' | 'sideEffects' | 'rules' | 'maxConcurrency' | 'pathsGroups'> &
  Combinations<Pick<ParsedFlow, 'pathsGroups'>> &
  ParsedFlowOptionalFields

export const createExpected = (
  expectedFlowsArrays: ExpectedFlow[],
  flowsConfig: Required<Configuration<UserFlow>>,
): ExpectedParsedFlow[] =>
  expectedFlowsArrays.map(flowToParse => {
    const nameObject = {
      hasPredefinedName: 'name' in flowToParse,
      name:
        'name' in flowToParse ? flowToParse.name : uuid().replace(new RegExp(flowsConfig.splitters.extends, 'g'), ''),
    }
    return {
      ...flowToParse,
      graph: convertExpectedFlowGraphArray(flowToParse.graph, flowsConfig, nameObject),
      ...('pathsGroups' in flowToParse && {
        pathsGroups: flowToParse.pathsGroups.map(array => array.map(groupId => `${groupId}`)),
      }),
      ...nameObject,
    }
  })

const convertExpectedFlowGraphArray = (
  expectedFlowGraphArray: ExpectedFlowGraphNode[],
  flowsConfig: Required<Configuration<UserFlow>>,
  nameObject: { hasPredefinedName: boolean; name: string },
) => {
  return expectedFlowGraphArray.map(node => {
    const displayNode = distractDisplayNameBySplitters(flowsConfig.splitters, Object.keys(node)[0])
    return {
      parentsIndexes: Object.values(node)[0][0],
      childrenIndexes: Object.values(node)[0][1],
      path: nameObject.hasPredefinedName ? displayNode.partialPath : [nameObject.name, ...displayNode.partialPath],
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
  splitters: Splitters,
  graph: Graph,
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
  hasPredefinedName: boolean
  name: string
  graph: (Node & { displayName?: string })[]
  pathsGroups?: ParsedFlow['pathsGroups']
} & ParsedFlowOptionalFields

const sortFlow = (splitters: Splitters) => (flow: ParsedFlowWithDisplyName): ParsedFlowWithDisplyName => {
  const { newGraph, oldIndexToNewIndex } = sortGraph(splitters, flow.graph)
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

const sortFlows = (splitters: Splitters) => (flows: ParsedFlowWithDisplyName[]): ParsedFlowWithDisplyName[] => {
  const withSourceIndexes = flows.map(sortFlow(splitters)).map((flow, startIndex) => ({
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

const removeGeneratedNamesFromGraph = (splitters: Splitters, flows: ParsedFlowWithDisplyName[]) => (
  graph: ParsedFlowWithDisplyName['graph'],
) =>
  graph.map(node => {
    const newNode = {
      ...node,
      path: node.path.filter(flowName => {
        const flow = flows.find(f => f.name === flowName)
        return (flow as ParsedFlowWithDisplyName).hasPredefinedName
      }),
    }
    newNode.displayName = graphNodeToDisplayName(splitters)(newNode)
    return newNode
  })

function fillNames({
  splitters,
  actualFlowsArray,
  expectedFlowArray,
  count,
}: {
  splitters: Splitters
  actualFlowsArray: ParsedFlowWithDisplyName[]
  expectedFlowArray: ParsedFlowWithDisplyName[]
  count: number
}) {
  if (count > 0) {
    return expectedFlowArray
  }

  const oldToNewName: { [oldName: string]: string } = {}

  for (const actualFlowIndex in actualFlowsArray) {
    const actualFlow = actualFlowsArray[actualFlowIndex]
    if (!actualFlow.hasPredefinedName) {
      const graphWithoutGeneratedNames = removeGeneratedNamesFromGraph(splitters, actualFlowsArray)(actualFlow.graph)

      const expectedFlow = expectedFlowArray.find(f => {
        const expectedGraphWithoutGeneratedNames = removeGeneratedNamesFromGraph(splitters, expectedFlowArray)(f.graph)
        return deepEqual(expectedGraphWithoutGeneratedNames, graphWithoutGeneratedNames)
      }) as ParsedFlowWithDisplyName
      chaiExpect(
        expectedFlow,
        `can't find the expect flow that corespond to this actual flow:\n${flowToString(actualFlow)}\n${graphToString(
          actualFlow.graph,
        )}\n\ngood guess that this is the missing expected flow:\n${flowToString(
          expectedFlowArray[actualFlowIndex],
        )}\n${graphToString(expectedFlowArray[actualFlowIndex].graph)}`,
      ).not.undefined

      oldToNewName[expectedFlow.name] = actualFlow.name
    } else {
      oldToNewName[actualFlow.name] = actualFlow.name
    }
  }

  return expectedFlowArray.map(flow => ({
    ...flow,
    name: oldToNewName[flow.name],
    graph: flow.graph.map(node => {
      const newNode = {
        ...node,
        path: node.path.map(oldFlowName => oldToNewName[oldFlowName]),
      }
      return {
        ...newNode,
        displayName: graphNodeToDisplayName(splitters)(newNode),
      }
    }),
  }))
}

const buildErrorMessage = ({
  expectedFlow,
  guessedFlow,
  count,
}: {
  expectedFlow: ParsedFlowWithDisplyName
  guessedFlow: ParsedFlowWithDisplyName
  count: number
}) =>
  `${count === 0 ? 'expected' : 'actual'} flow: ${
    expectedFlow.hasPredefinedName ? expectedFlow.name : '__NO_NAME__'
  } - does not exist: \n${flowToString(expectedFlow)} \n${graphToString(expectedFlow.graph)}
        \n\ngood guess that this is the ${count === 0 ? 'actual' : 'expected'} graph (same index):
        \n${flowToString(guessedFlow)} \n${graphToString(guessedFlow.graph)}`

export function assertEqualFlows(
  splitters: Splitters,
  expectedFlowsArray: ParsedFlowWithDisplyName[],
  actualFlowsArray: ParsedFlowWithDisplyName[],
  count = -1,
) {
  if (count === -1) {
    // re-order all arrays to be in the same order and make all the random ids in both arrays the same ids.
    const expectedFlowsArray2 = sortFlows(splitters)(expectedFlowsArray)
    const newActualFlowsArray = sortFlows(splitters)(actualFlowsArray)

    const newExpectedFlowsArray = fillNames({
      splitters,
      expectedFlowArray: expectedFlowsArray2,
      actualFlowsArray: newActualFlowsArray,
      count,
    })
    assertEqualFlows(splitters, newExpectedFlowsArray, newActualFlowsArray, count + 1)
    return
  }

  if (count > 1) {
    return
  }

  expectedFlowsArray.forEach((expectedFlow, i) => {
    const actualFlow = findFlowByFlow(actualFlowsArray, expectedFlow)
    const errorMessage = buildErrorMessage({
      expectedFlow,
      count,
      guessedFlow: actualFlow || actualFlowsArray[i],
    })
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

  assertEqualFlows(splitters, actualFlowsArray, expectedFlowsArray, count + 1)
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
      (flow.hasPredefinedName && flowToSearch.hasPredefinedName && flow.name === flowToSearch.name) ||
      // @ts-ignore
      (flow.defaultNodeIndex === flowToSearch.defaultNodeIndex && stringNow === stringToFind)
    )
  })
}

function flowToString(flow: ParsedFlowWithDisplyName) {
  let str = ''
  if (flow.hasPredefinedName) {
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
