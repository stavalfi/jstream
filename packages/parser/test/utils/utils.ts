import { parse } from '@parser/index'
import { distractDisplayNameBySplitters, graphNodeToDisplayName } from '@parser/utils'
import { table } from 'table'
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
import { expect } from 'chai'

type ExpectedFlowGraphNode = { [key1: string]: [number[], number[]] }
export type ExpectedFlow = {
  name?: string
  graph: ExpectedFlowGraphNode[]
  defaultNodeIndex?: number
  extendedFlowIndex?: number
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
      defaultNodeIndex: 0,
    }),
  )

export const createExpected = (
  expectedFlowsArrays: ExpectedFlow[],
  flowsConfig: Required<Configuration<UserFlow>>,
): Omit<ParsedFlow, 'id' | 'sideEffects' | 'rules'>[] =>
  expectedFlowsArrays.map(flowToParse => ({
    ...flowToParse,
    graph: convertExpectedFlowGraphArray(flowToParse.graph, flowsConfig),
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

function sortGraph(graph: Graph, splitters = { extends: '_', identifier: '/' }): (Node & { displayName: string })[] {
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

  return newGraph
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
    }))
}

type ParsedFlowWithDisplyName = {
  graph: (Node & { displayName?: string })[]
} & ParsedFlowOptionalFields

export function assertEqualFlows(
  expectedFlowsArray1: ParsedFlowWithDisplyName[],
  actualFlowsArray1: ParsedFlowWithDisplyName[],
  count = 0,
) {
  const expectedFlowsArray = expectedFlowsArray1.map(flow => ({
    ...flow,
    graph: sortGraph(flow.graph),
  }))
  const actualFlowsArray = actualFlowsArray1.map(flow => ({
    ...flow,
    graph: sortGraph(flow.graph),
  }))
  if (count > 1) {
    return
  }
  expectedFlowsArray.forEach((expectedFlow, i) => {
    const actualFlow = findFlowByFlow(actualFlowsArray, expectedFlow)
    const errorMessage = `${count === 0 ? 'expected' : 'actual'} flow: ${
      'name' in expectedFlow ? expectedFlow.name : '__NO_NAME__'
    } - does not exist: \n${flowToString(expectedFlow)} \n${graphToString(expectedFlow.graph)}
        \n\ngood guess that this is the ${count === 0 ? 'actual' : 'expected'} graph (same index):
        \n${flowToString(actualFlowsArray[i])} \n${graphToString(actualFlowsArray[i].graph)}`
    expect(actualFlow, errorMessage).to.be.a('object')
    if (actualFlow) {
      expect(actualFlow.graph, errorMessage).deep.equal(expectedFlow.graph)
      if ('defaultNodeIndex' in expectedFlow) {
        expect('defaultNodeIndex' in actualFlow, errorMessage).deep.equal(true)
        // @ts-ignore   -> i have expect in the previous line.
        expect(actualFlow.defaultNodeIndex, errorMessage).deep.equal(expectedFlow.defaultNodeIndex)
      }
      if (count === 0 && 'extendedFlowIndex' in expectedFlow) {
        const expectedExtendedFlow = expectedFlowsArray[expectedFlow.extendedFlowIndex as number]
        expect('extendedFlowIndex' in actualFlow, errorMessage).deep.equal(true)
        // @ts-ignore   -> i have expect in the previous line.
        const actualExtendedFlow = actualFlowsArray[actualFlow.extendedFlowIndex as number]

        const isEqual =
          // @ts-ignore
          expectedExtendedFlow.name === actualExtendedFlow.name &&
          // @ts-ignore
          expectedExtendedFlow.defaultNodeIndex === actualExtendedFlow.defaultNodeIndex &&
          graphToString(expectedExtendedFlow.graph) === graphToString(actualExtendedFlow.graph)
        expect(
          isEqual,
          // @ts-ignore
          `${count === 0 ? 'expected' : 'actual'} flow: ${expectedFlow.name} - has different extended flow`,
        ).deep.equal(true)
      }
    }
  })

  // assertEqualFlows(actualFlowsArray1, expectedFlowsArray1, count + 1)
}

function findFlowByFlow(flowsArray: ParsedFlowWithDisplyName[], flowToSearch: ParsedFlowWithDisplyName) {
  return flowsArray.find(flow => {
    let stringToFind = graphToString(flowToSearch.graph)
    let stringNow = graphToString(flow.graph)
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
