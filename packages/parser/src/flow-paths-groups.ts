import { AlgorithmParsedFlow, Graph, Node, ParsedUserFlow, PathsGroups } from '@parser/types'
import { uuid } from '@jstream/utils'
import { getHeadsIndexOfSubFlows } from '@parser/utils'

export function flowPathsGroups<UnparsedExtensions, Extensions>({
  parsedFlows,
  flowToParse,
  parsedGraph,
  extendedParsedFlow,
}: {
  parsedFlows: AlgorithmParsedFlow<Extensions>[]
  flowToParse: ParsedUserFlow<UnparsedExtensions>
  parsedGraph: Graph
  extendedParsedFlow?: AlgorithmParsedFlow<Extensions>
}): PathsGroups {
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
          path: node.path.slice(1),
        }
      : {
          ...node,
          path: node.path.slice(1),
        },
  )

  const pathsGroups: PathsGroups = graph.map(node => node.path.map(() => ''))

  subFlowHeadIndexes.forEach(startIndex => fillGroupsOfSubFlow({ startIndex, parsedGraph: graph, pathsGroups }))

  return pathsGroups.map(pathGroups => [mainGroupId, ...pathGroups])
}

function fillGroupsOfSubFlow<Extensions = {}>({
  parsedGraph,
  pathsGroups,
  startIndex,
}: {
  parsedGraph: (Node & ({ subFlow: string } | {}))[]
  pathsGroups: PathsGroups
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
