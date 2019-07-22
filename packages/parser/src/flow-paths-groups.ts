import { AlgorithmParsedFlow, Graph, ParsedFlow, UserFlowObject } from '@parser/types'
import { uuid } from '@flow/utils'

type FlowPathsGroups = ({
  parsedFlows,
  flowToParse,
  parsedGraph,
  extendedParsedFlow,
}: {
  parsedFlows: AlgorithmParsedFlow[]
  flowToParse: UserFlowObject
  parsedGraph: Graph
  extendedParsedFlow?: AlgorithmParsedFlow
}) => ParsedFlow['pathsGroups']

export const flowPathsGroups: FlowPathsGroups = ({ parsedFlows, flowToParse, parsedGraph, extendedParsedFlow }) => {
  const mainGroupId = uuid()
  if (parsedGraph.length === 1 && parsedGraph[0].path.length === 1) {
    return [[mainGroupId]]
  }

  return parsedGraph
    .map(({ path }) => path['name' in flowToParse ? 1 : 0])
    .reduce((acc: { subFlowName: string; repeats: number }[], subFlowName) => {
      if (acc.length === 0 || acc[acc.length - 1].subFlowName !== subFlowName) {
        return acc.concat([
          {
            subFlowName,
            repeats: 1,
          },
        ])
      } else {
        return acc.slice(0, acc.length - 1).concat([
          {
            subFlowName,
            repeats: acc[acc.length - 1].repeats + 1,
          },
        ])
      }
    }, [])
    .flatMap(({ subFlowName, repeats }) => {
      const parsedFlow = findParsedFlow(parsedFlows, subFlowName, extendedParsedFlow)
      const actualRepeats = repeats / parsedFlow.graph.length
      return Array.from(Array(actualRepeats).keys()).flatMap(() => replaceGroupsIds(parsedFlow.pathsGroups))
    })
    .map(subFlowPathGroups => [mainGroupId, ...subFlowPathGroups])
}

function findParsedFlow(
  parsedFlows: ParsedFlow[],
  flowName: string,
  extendedParsedFlow?: AlgorithmParsedFlow,
): Pick<ParsedFlow, 'graph' | 'pathsGroups'> {
  const flow = parsedFlows.find(flow => 'name' in flow && flow.name === flowName)
  if (!flow) {
    let pos: false | undefined | AlgorithmParsedFlow = extendedParsedFlow
    while (pos) {
      if ('name' in pos && pos.name === flowName) {
        return pos
      }
      pos = 'extendedParsedFlow' in pos && pos.extendedParsedFlow
    }
    throw new Error(
      `bug in parser algorithm: can't find extended-flow-name: ${flowName}. please file an issue in github.`,
    )
  }
  return flow
}

function replaceGroupsIds(pathsGroups: ParsedFlow['pathsGroups']): ParsedFlow['pathsGroups'] {
  const oldGroupIdToNewGroupId: { [key: string]: string } = {}
  const newPathsGroups = pathsGroups.map(pathsGroups => [...pathsGroups])
  for (let i = 0; i < pathsGroups.length; i++) {
    for (let j = 0; j < pathsGroups[i].length; j++) {
      if (!(pathsGroups[i][j] in oldGroupIdToNewGroupId)) {
        oldGroupIdToNewGroupId[pathsGroups[i][j]] = uuid()
      }
      newPathsGroups[i][j] = oldGroupIdToNewGroupId[pathsGroups[i][j]]
    }
  }
  return newPathsGroups
}
