import { isSubsetOf, ParsedFlow, Path, displayNameToFullGraphNode, Splitters } from '@flow/parser'
import { isString as _isString, isNumber as _isNumber } from 'lodash'

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
