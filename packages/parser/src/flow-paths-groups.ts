import { AlgorithmParsedFlow, Graph, Node, ParsedFlow, ParsedUserFlow } from '@parser/types'
import { uuid } from '@flow/utils'
import { getHeadsIndexOfSubFlows } from '@parser/utils'

type FlowPathsGroups = ({
  parsedFlows,
  flowToParse,
  parsedGraph,
  extendedParsedFlow,
}: {
  parsedFlows: AlgorithmParsedFlow[]
  flowToParse: ParsedUserFlow
  parsedGraph: Graph
  extendedParsedFlow?: AlgorithmParsedFlow
}) => ParsedFlow['pathsGroups']

export const flowPathsGroups: FlowPathsGroups = ({ parsedFlows, flowToParse, parsedGraph, extendedParsedFlow }) => {
  const mainGroupId = uuid()
  if (parsedGraph.length === 1 && parsedGraph[0].path.length === 1) {
    return [[mainGroupId]]
  }

  const subFlowHeadIndexes = getHeadsIndexOfSubFlows({
    parsedFlows,
    flowToParse,
    graph: parsedGraph,
    extendedParsedFlow,
  })

  const graph = parsedGraph.map((node, i) =>
    subFlowHeadIndexes.includes(i)
      ? {
          ...node,
          subFlow: 'this value is not used',
          path: 'name' in flowToParse ? node.path.slice(1) : node.path,
        }
      : {
          ...node,
          path: 'name' in flowToParse ? node.path.slice(1) : node.path,
        },
  )

  const pathsGroups: ParsedFlow['pathsGroups'] = graph.map(node => node.path.map(() => ''))

  subFlowHeadIndexes.forEach(startIndex => fillGroupsOfSubFlow({ startIndex, parsedGraph: graph, pathsGroups }))

  return pathsGroups.map(pathGroups => [mainGroupId, ...pathGroups])
}

function fillGroupsOfSubFlow({
  parsedGraph,
  pathsGroups,
  startIndex,
}: {
  parsedGraph: (Node & ({ subFlow: string } | {}))[]
  pathsGroups: ParsedFlow['pathsGroups']
  startIndex: number
}): void {
  const visited = parsedGraph.map(() => false)

  function travel(pathGroups: { flowName: string; groupId: string }[], nodeIndex: number): void {
    if (!visited[nodeIndex] && (nodeIndex === startIndex || !('subFlow' in parsedGraph[nodeIndex]))) {
      visited[nodeIndex] = true
      const replaceIndex =
        pathGroups.length === 0
          ? 0
          : pathGroups.findIndex(({ flowName }, i) => parsedGraph[nodeIndex].path[i] !== flowName)
      const newPathGroups = pathGroups
        .slice(0, replaceIndex)
        .concat(parsedGraph[nodeIndex].path.slice(replaceIndex).map(flowName => ({ flowName, groupId: uuid() })))
      newPathGroups.forEach(({ groupId }, i) => (pathsGroups[nodeIndex][i] = groupId))
      parsedGraph[startIndex].childrenIndexes.forEach(childIndex => travel(newPathGroups, childIndex))
    }
  }

  travel([], startIndex)
}
