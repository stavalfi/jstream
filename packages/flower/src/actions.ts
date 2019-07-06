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
import { isSubsetOf, Node, Path } from '@flow/parser'
import isPromise from 'is-promise'
import { Combinations } from '@flow/utils'

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

      const toNodeIndex = action.payload.toNodeIndex
      const toNode = flow.graph[toNodeIndex]
      const sideEffect = findByNodeOrDefault(flow.sideEffects, toNode)
      if (!sideEffect) {
        return action
      }

      // const rule = findByNodeOrDefault(flow.rules, toNode)
      //
      // try {
      //   const resultContainer = sideEffect.sideEffectFunc(flow)(toNode)()
      //   if (!rule) {
      //     return action
      //   }
      //   if (isPromise<string>(resultContainer)) {
      //     return resultContainer.then(result => {
      //       const nextNode = rule.
      //       if (nextNode) {
      //         return dispatch(
      //           advance(
      //             advanceFlowActionCreator({
      //               ...payload,
      //               fromNodeIndex: payload.toNodeIndex,
      //               toNodeIndex: userNodeToNodeObject(action.payload.toNodeIndex)(nextNode),
      //             }),
      //           ),
      //         )
      //       } else {
      //         return action
      //       }
      //     })
      //   }
      // } catch (e) {}
      const result = sideEffect.side_effect(flow)(toNode, toNodeIndex, flow.graph)()

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
                fromNodeIndex: toNodeIndex,
                toNodeIndex: userNodeToNodeObject(toNodeIndex)(result),
              }),
            ),
          )
        : action
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
