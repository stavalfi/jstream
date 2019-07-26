import { isSubsetOf, ParsedFlow, Path, displayNameToFullGraphNode, Splitters } from '@flow/parser'
import { isString as _isString, isNumber as _isNumber } from 'lodash'
import { ActiveFlow } from '@flower/types'

type UserInputNodeToNodeIndex = ({
  splitters,
  flows,
  flow,
}: {
  splitters: Splitters
  flows: ParsedFlow[]
  flow: ParsedFlow
}) => (fromNodeIndex: number) => (userNode: number | string | Path) => number

export const userInputNodeToNodeIndex: UserInputNodeToNodeIndex = ({
  splitters,
  flows,
  flow,
}) => fromNodeIndex => userNode => {
  const stringToNode = displayNameToFullGraphNode(splitters)({
    parsedFlows: flows,
    ...('name' in flow && { name: flow.name }),
    ...('extendedFlowIndex' in flow && { extendedFlowIndex: flows[flow.extendedFlowIndex] }),
  })

  const { graph } = flow

  if (_isNumber(userNode)) {
    return userNode
  }

  const nodePathToSearch = _isString(userNode) ? stringToNode(userNode).path : userNode

  const index = graph[fromNodeIndex].childrenIndexes.find(i => isSubsetOf(nodePathToSearch, graph[i].path))
  return _isNumber(index) ? index : -1
}

type GetFlowDetails = (
  flows: ParsedFlow[],
  activeFlows: ActiveFlow[],
  activeFlowId: string,
) =>
  | {}
  | ({
      activeFlow: ActiveFlow
      activeFlowIndex: number
    } & (
      | {}
      | {
          flow: ParsedFlow
          flowIndex: number
        }
    ))

export const getFlowDetails: GetFlowDetails = (flows, activeFlows, activeFlowId) => {
  const activeFlowIndex = activeFlows.findIndex(activeFlow => activeFlow.id === activeFlowId)
  if (activeFlowIndex === -1) {
    return {}
  }

  const flowIndex = flows.findIndex(flow => flow.id === activeFlows[activeFlowIndex].flowId)

  if (flowIndex === -1) {
    return { activeFlowIndex, activeFlow: activeFlows[activeFlowIndex], flowIndex }
  }

  return {
    flow: flows[flowIndex],
    flowIndex,
    activeFlow: activeFlows[activeFlowIndex],
    activeFlowIndex,
  }
}

export function findByNodeOrDefault<T>(array: T[], predicate: (t1: T) => boolean): T | undefined {
  const element = array.find(predicate)
  return element || array.find(element => !('node' in element))
}

export const flatMapPromisesResults = <T>(promises: Promise<T[]>[]): Promise<T[]> =>
  Promise.all(promises).then(array => array.flatMap(array => array))
