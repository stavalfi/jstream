import {
  AdvanceFlowAction,
  AdvanceFlowActionCreator,
  AdvanceGraphThunk,
  ExecuteFlowActionCreator,
  ExecuteFlowThunkCreator,
  FinishFlowActionCreator,
  FlowActionType,
  FlowReducerSelector,
  UpdateConfigActionCreator,
} from '@flower/types'
import uuid from 'uuid/v1'
import { userInputNodeToNodeIndex } from '@flower/utils'
import { isSubsetOf, Node, Path } from '@flow/parser'
import { Combinations } from '@flow/utils'

export const updateConfigActionCreator: UpdateConfigActionCreator = payload => ({
  type: FlowActionType.updateConfig,
  payload,
})

export const advanceFlowActionCreator: AdvanceFlowActionCreator = payload => ({
  type: FlowActionType.advanceFlowGraph,
  payload,
})

// it is exported only to test the reducer.
export const executeFlowActionCreator: ExecuteFlowActionCreator = payload => {
  return {
    type: FlowActionType.executeFlow,
    payload,
  }
}

export const finishFlowActionCreator: FinishFlowActionCreator = payload => {
  return {
    type: FlowActionType.finishFlow,
    payload,
  }
}

export const executeFlowThunkCreator: ExecuteFlowThunkCreator = reducerSelector => flowName => dispatch => {
  const action = dispatch(executeFlowActionCreator({ flowName, id: uuid() }))
  return dispatch(
    advanceGraphThunk(reducerSelector)(advanceFlowActionCreator({ id: action.payload.id, toNodeIndex: 0 })),
  )
}

export const advanceGraphThunk = (reducerSelector: FlowReducerSelector) =>
  function advance(action: AdvanceFlowAction): AdvanceGraphThunk {
    return (dispatch, getState) => {
      dispatch(action)
      const { flows, activeFlows, ...restOfState } = reducerSelector(getState())
      if (!('splitters' in restOfState)) {
        return action
      }
      const { splitters } = restOfState
      const activeFlow = activeFlows.find(activeFlow => activeFlow.id === action.payload.id)
      if (!activeFlow) {
        return action
      }
      const flow = flows.find(flow => flow.id === activeFlow.flowId)
      if (!flow) {
        return action
      }

      const toNodeIndex = action.payload.toNodeIndex
      const toNode = flow.graph[toNodeIndex]
      const sideEffect = findByNodeOrDefault(flow.sideEffects, toNode)

      const rule = findByNodeOrDefault(flow.rules, toNode)

      return new Promise((res, rej) => {
        try {
          res(sideEffect && sideEffect.sideEffectFunc(flow)(toNode)())
        } catch (e) {
          rej(e)
        }
      })
        .then(result => rule && 'next' in rule && rule.next(flow)(toNode, toNodeIndex, flow.graph)(result))
        .catch(error => rule && 'error' in rule && rule.error(flow)(toNode, toNodeIndex, flow.graph)(error))
        .then(nextNode =>
          !nextNode
            ? action
            : dispatch(
                advance(
                  advanceFlowActionCreator({
                    id: action.payload.id,
                    fromNodeIndex: toNodeIndex,
                    toNodeIndex: userInputNodeToNodeIndex({
                      splitters,
                      flows,
                      flow,
                    })(toNodeIndex)(nextNode),
                  }),
                ),
              ),
        )
    }
  }

function findByNodeOrDefault<T>(
  array: (T & Combinations<{ node: { path: Path } }>)[],
  node: Node,
): (T & Combinations<{ node: { path: Path } }>) | undefined {
  const element = array.find(e => 'node' in e && isSubsetOf(e.node.path, node.path))
  if (element) {
    return element
  }
  return array.find(element => !('node' in element))
}
