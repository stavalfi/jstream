import { uuid } from '@flow/utils'
import { userInputNodeToNodeIndex } from '@flower/utils'
import { isSubsetOf } from '@flow/parser'
import {
  AdvanceGraphThunk,
  ExecuteFlowThunkCreator,
  FlowActionByType,
  FlowActionCreator,
  FlowActionType,
  FlowReducerSelector,
} from '@flower/types'

export const updateConfigActionCreator: FlowActionCreator<FlowActionType.updateConfig> = payload => ({
  type: FlowActionType.updateConfig,
  payload,
})

// it is exported only to test the reducer.
export const executeFlowActionCreator: FlowActionCreator<FlowActionType.executeFlow> = payload => {
  return {
    type: FlowActionType.executeFlow,
    payload,
  }
}

export const advanceFlowActionCreator: FlowActionCreator<FlowActionType.advanceFlowGraph> = payload => ({
  type: FlowActionType.advanceFlowGraph,
  payload,
})

export const finishFlowActionCreator: FlowActionCreator<FlowActionType.finishFlow> = payload => {
  return {
    type: FlowActionType.finishFlow,
    payload,
  }
}

export const executeFlowThunkCreator: ExecuteFlowThunkCreator = reducerSelector => flow => dispatch => {
  const action = dispatch(
    executeFlowActionCreator({ flowId: flow.id, ...('name' in flow && { flowName: flow.name }), id: uuid() }),
  )
  return dispatch(
    advanceGraphThunk(reducerSelector)(
      advanceFlowActionCreator({
        id: action.payload.id,
        flowId: flow.id,
        ...('name' in flow && { flowName: flow.name }),
        toNodeIndex: 0,
      }),
    ),
  )
}

export const advanceGraphThunk = (reducerSelector: FlowReducerSelector) =>
  function advance(action: FlowActionByType[FlowActionType.advanceFlowGraph]): AdvanceGraphThunk {
    return (dispatch, getState) => {
      dispatch(action)
      const { flows, activeFlows, ...restOfState } = reducerSelector(getState())
      if (!('splitters' in restOfState)) {
        return Promise.resolve([action])
      }
      const { splitters } = restOfState
      const activeFlow = activeFlows.find(activeFlow => activeFlow.id === action.payload.id)
      if (!activeFlow) {
        return Promise.resolve([action])
      }
      const flow = flows.find(flow => flow.id === activeFlow.flowId)
      if (!flow) {
        return Promise.resolve([action])
      }

      const { toNodeIndex } = action.payload

      const toAdvanceAction = (nextNodeIndex: number) =>
        advanceFlowActionCreator({
          id: action.payload.id,
          flowId: flow.id,
          ...('name' in flow && { flowName: flow.name }),
          fromNodeIndex: toNodeIndex,
          toNodeIndex: nextNodeIndex,
        })

      const toNode = flow.graph[toNodeIndex]
      const sideEffect = findByNodeOrDefault(
        flow.sideEffects,
        sideEffect => 'node' in sideEffect && isSubsetOf(sideEffect.node.path, toNode.path),
      )

      const rule = findByNodeOrDefault(flow.rules, rule => 'node' in rule && isSubsetOf(rule.node.path, toNode.path))

      return new Promise((res, rej) => {
        try {
          res(sideEffect && sideEffect.sideEffectFunc(flow)(toNode)())
        } catch (e) {
          rej(e)
        }
      })
        .then(result => rule && 'next' in rule && rule.next(flow)(toNode, toNodeIndex, flow.graph)(result))
        .catch(error => rule && 'error' in rule && rule.error(flow)(toNode, toNodeIndex, flow.graph)(error))
        .then(nextNodeNames => nextNodeNames && (Array.isArray(nextNodeNames) ? nextNodeNames : [nextNodeNames]))
        .then(nextNodeNames => {
          if (nextNodeNames) {
            const nextNodesIndexes = nextNodeNames.map(nodeName =>
              userInputNodeToNodeIndex({
                splitters,
                flows,
                flow,
              })(toNodeIndex)(nodeName),
            )
            const promises = nextNodesIndexes.map(nextNodeIndex => dispatch(advance(toAdvanceAction(nextNodeIndex))))
            return Promise.all(promises).then(array => array.flatMap(array => array))
          } else {
            return [action]
          }
        })
    }
  }

function findByNodeOrDefault<T>(array: T[], predicate: (t1: T) => boolean): T | undefined {
  const element = array.find(predicate)
  return element || array.find(element => !('node' in element))
}
