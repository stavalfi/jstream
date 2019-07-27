import {
  AdvanceGraphThunk,
  ExecuteFlowThunkCreator,
  FlowActionByType,
  FlowActionType,
  FlowReducerSelector,
  FlowState,
  Request,
} from '@flower/types'
import { uuid } from '@flow/utils'
import { findByNodeOrDefault, flatMapPromisesResults, getFlowDetails, userInputNodeToNodeIndex } from '@flower/utils'
import { isSubsetOf } from '@flow/parser'
import { advanceFlowActionCreator, executeFlowActionCreator } from '@flower/actions'

export const executeFlowThunkCreator: ExecuteFlowThunkCreator = reducerSelector => flow => (dispatch, getState) => {
  const action = dispatch(
    executeFlowActionCreator({ flowId: flow.id, ...('name' in flow && { flowName: flow.name }), activeFlowId: uuid() }),
  )

  const { flows, activeFlows } = reducerSelector(getState())
  const flowDetails = getFlowDetails(flows, activeFlows, action.payload.activeFlowId)
  if (!('flow' in flowDetails) || !('activeFlow' in flowDetails)) {
    return Promise.resolve([])
  }

  return dispatch(
    advanceGraphThunkCreator(reducerSelector)(
      advanceFlowActionCreator({
        activeFlowId: action.payload.activeFlowId,
        flowId: flow.id,
        ...('name' in flowDetails.flow && { flowName: flowDetails.flow.name }),
        toNodeIndex: 0,
      }),
    ),
  )
}

export const advanceGraphThunkCreator = (reducerSelector: FlowReducerSelector) =>
  function advance(action: FlowActionByType[FlowActionType.advanceFlowGraph]): AdvanceGraphThunk {
    return (dispatch, getState) => {
      const { advanced: lastAdvanced } = reducerSelector(getState())
      dispatch(action)

      const { advanced } = reducerSelector(getState())

      if (lastAdvanced === advanced) {
        return Promise.resolve([])
      }

      return flatMapPromisesResults(
        advanced.map(async request => {
          const actions = await getNextAdvanceActions(request)(reducerSelector(getState()))
          return flatMapPromisesResults(actions.map(action => dispatch(advance(action))))
        }),
      )
    }
  }

type GetNextAdvanceActions = (
  request: Request,
) => (state: FlowState) => Promise<FlowActionByType[FlowActionType.advanceFlowGraph][]>

const getNextAdvanceActions: GetNextAdvanceActions = request => ({ flows, activeFlows, ...restOfState }) => {
  if (!('splitters' in restOfState)) {
    return Promise.resolve([])
  }

  const { splitters } = restOfState

  const flowDetails = getFlowDetails(flows, activeFlows, request.payload.activeFlowId)
  if (!('flow' in flowDetails) || !('activeFlow' in flowDetails)) {
    return Promise.resolve([])
  }

  const { flow } = flowDetails

  const toNode = flow.graph[request.payload.toNodeIndex]
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
    .then<string | string[], string | string[]>(
      result =>
        rule && 'next' in rule
          ? rule.next(flow)(toNode, request.payload.toNodeIndex, flow.graph)(result)
          : Promise.resolve([]),
      error =>
        rule && 'error' in rule
          ? rule.error(flow)(toNode, request.payload.toNodeIndex, flow.graph)(error)
          : Promise.resolve([]),
    )
    .then<string[], string[]>(
      nextNodeNames => (nextNodeNames ? (Array.isArray(nextNodeNames) ? nextNodeNames : [nextNodeNames]) : []),
      error => {
        console.log(
          'custom rule function threw error. this library will assume that this rule returned an empty array instead. error:',
          error,
        )
        return []
      },
    )
    .then(nextNodeNames =>
      nextNodeNames
        .map(nodeName =>
          userInputNodeToNodeIndex({
            splitters,
            flows,
            flow,
          })(request.payload.toNodeIndex)(nodeName),
        )
        .map(nextNodeIndex =>
          advanceFlowActionCreator({
            activeFlowId: request.payload.activeFlowId,
            flowId: flow.id,
            ...('name' in flow && { flowName: flow.name }),
            fromNodeIndex: request.payload.toNodeIndex,
            toNodeIndex: nextNodeIndex,
          }),
        ),
    )
}
