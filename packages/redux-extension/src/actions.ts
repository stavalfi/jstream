import {
  AdvanceFlowAction,
  AdvanceFlowActionCreator,
  AdvanceGraphThunk,
  ExecuteFlowActionCreator,
  ExecuteFlowThunkCreator,
  FlowActionType,
  FlowReducerSelector,
  UpdateConfigActionCreator,
} from 'types'
import uuid from 'uuid/v1'
import { areNodesEqual, getActiveNodesIndexes, getSideEffects, userInputNodeToNodeIndex } from 'utils'
import { displayNameToFullGraphNode, isSubsetOf } from '@flow/parser'
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

export const executeFlowThunkCreator: ExecuteFlowThunkCreator = reducerSelector => flowName => (dispatch, getState) => {
  const action = dispatch(executeFlowActionCreator({ flowName, id: uuid() }))
  const { activeFlows } = reducerSelector(getState())
  const activeFlow = activeFlows.find(activeFlow => activeFlow.id === action.payload.id)
  if (!activeFlow) {
    return action
  }
  return dispatch(
    advanceGraphThunk(reducerSelector)(advanceFlowActionCreator({ flowName, id: action.payload.id, toNodeIndex: 0 })),
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
        return action // todo: return or throw something else
      }

      const userNodeToNodeObject = userInputNodeToNodeIndex({
        stringToNode: displayNameToFullGraphNode(splitters)({
          parsedFlows: flows,
          ...('name' in activeFlow && { name: activeFlow.name }),
          ...('extendedFlowIndex' in activeFlow && { extendedFlowIndex: flows[activeFlow.extendedFlowIndex] }),
        }),
        graph: activeFlow.graph,
      })

      const activeNodeIndex =
        getActiveNodesIndexes(activeFlow.graph).find(i =>
          areNodesEqual(activeFlow.graph[i], activeFlow.graph[action.payload.toNodeIndex]),
        ) || 0

      const activeNode = activeFlow.graph[activeNodeIndex]
      const sideEffects = getSideEffects(flows, activeFlow)
      const sideEffect = sideEffects.find(sideEffect => isSubsetOf(sideEffect.node.path, activeNode.path))

      if (!sideEffect || !sideEffect.hasOwnProperty('sideEffectFunc')) {
        return action
      }

      const result = sideEffect.sideEffectFunc(activeFlow)(activeNode)

      if (isPromise<string>(result)) {
        return result.then(nextNode => {
          if (nextNode) {
            return dispatch(
              advance(
                advanceFlowActionCreator({
                  ...payload,
                  fromNodeIndex: payload.toNodeIndex,
                  toNodeIndex: userNodeToNodeObject(activeNodeIndex)(nextNode),
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
                fromNodeIndex: activeNodeIndex,
                toNodeIndex: userNodeToNodeObject(activeNodeIndex)(result),
              }),
            ),
          )
        : action
    }
  }
