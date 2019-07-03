import {
  AdvanceFlowAction,
  AdvanceFlowActionCreator,
  AdvanceGraphThunk,
  ExecuteFlowActionCreator,
  ExecuteFlowThunkCreator,
  FlowActionType,
  FlowReducerSelector,
  UpdateConfigActionCreator,
} from '@flower/types'
import uuid from 'uuid/v1'
import { userInputNodeToNodeIndex } from '@flower/utils'
import { isSubsetOf } from '@flow/parser'
import isPromise from 'is-promise'

export const updateConfigActionCreator: UpdateConfigActionCreator = payload => ({
  type: FlowActionType.updateConfig,
  payload,
})

const executeFlowActionCreator: ExecuteFlowActionCreator = payload => {
  return {
    type: FlowActionType.executeFlow,
    payload,
  }
}

export const advanceFlowActionCreator: AdvanceFlowActionCreator = payload => ({
  type: FlowActionType.advanceFlowGraph,
  payload,
})

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
      const { payload } = action
      const activeFlow = activeFlows.find(activeFlow => activeFlow.id === action.payload.id)
      if (!activeFlow) {
        return action
      }
      const flow = flows.find(flow => flow.id === activeFlow.flowId)
      if (!flow) {
        return action
      }

      const sideEffect = flow.sideEffects.find(sideEffect =>
        'node' in sideEffect
          ? isSubsetOf(sideEffect.node.path, flow.graph[action.payload.toNodeIndex].path)
          : sideEffect,
      )
      if (!sideEffect) {
        return action
      }

      const result = sideEffect.sideEffectFunc(flow)(flow.graph[action.payload.toNodeIndex])

      const userNodeToNodeObject = userInputNodeToNodeIndex({
        splitters,
        flows,
        flow,
      })

      if (isPromise<string>(result)) {
        return result.then(nextNode => {
          if (nextNode) {
            return dispatch(
              advance(
                advanceFlowActionCreator({
                  ...payload,
                  fromNodeIndex: payload.toNodeIndex,
                  toNodeIndex: userNodeToNodeObject(action.payload.toNodeIndex)(nextNode),
                }),
              ),
            )
          } else {
            return action
          }
        })
      }

      return result
        ? dispatch(
            advance(
              advanceFlowActionCreator({
                ...payload,
                fromNodeIndex: action.payload.toNodeIndex,
                toNodeIndex: userNodeToNodeObject(action.payload.toNodeIndex)(result),
              }),
            ),
          )
        : action
    }
  }
