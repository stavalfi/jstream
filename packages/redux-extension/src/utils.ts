import { isSubsetOf, Node, Graph, ParsedFlow, SideEffect, Path } from '@flow/parser'
import { isString as _isString, isNumber as _isNumber } from 'lodash'

export function areNodesEqual(node1: Pick<Node, 'path'>, node2: Pick<Node, 'path'>) {
  if (node1.path.length !== node2.path.length) {
    return false
  }
  return node1.path.every((flowName, i) => flowName === node2.path[i])
}

export function getActiveNodesIndexes(graph: Graph): number[] {
  const visited = graph.map(() => false)
  function find(i: number): number[] {
    if (visited[i]) {
      return []
    }
    visited[i] = true
    // @ts-ignore
    if (graph[i].status === 'active') {
      return [i]
    }
    return graph[i].childrenIndexes.flatMap(find)
  }

  return find(0)
}

export function getSideEffects(flows: ParsedFlow[], flow: ParsedFlow): SideEffect[] {
  if (!flow) {
    return []
  } else {
    if (flow.sideEffects.length === 0 && 'extendedFlowIndex' in flow) {
      return getSideEffects(flows, flows[flow.extendedFlowIndex])
    } else {
      return flow.sideEffects
    }
  }
}

type UserInputNodeToNodeIndex = ({
  stringToNode,
  graph,
}: {
  stringToNode: (str: string) => Pick<Node, 'path'>
  graph: Graph
}) => (fromNodeIndex: number) => (userNode: number | string | Path) => number

export const userInputNodeToNodeIndex: UserInputNodeToNodeIndex = ({
  stringToNode,
  graph,
}) => fromNodeIndex => userNode => {
  if (_isNumber(userNode)) {
    return userNode
  } else {
    if (_isString(userNode)) {
      if (Number.isInteger(fromNodeIndex)) {
        return graph[fromNodeIndex].childrenIndexes.find(i => isSubsetOf([userNode], graph[i].path)) as number
      } else {
        return graph.findIndex(node => areNodesEqual(node, stringToNode(userNode)))
      }
    } else {
      if (Array.isArray(userNode)) {
        if (Number.isInteger(fromNodeIndex)) {
          return graph[fromNodeIndex].childrenIndexes.find(i => isSubsetOf(userNode, graph[i].path)) as number
        } else {
          // todo: fill this
        }
      }
    }
    // just to tell the compiler to shutup:
    return -1
  }
}
