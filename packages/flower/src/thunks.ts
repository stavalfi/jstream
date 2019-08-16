import {
  AdvanceGraphThunk,
  ExecuteFlowThunkCreator,
  FlowActionByType,
  FlowActionType,
  FlowReducerSelector,
  FlowState,
  Request,
} from '@flower/types'
import { uuid } from '@jstream/utils'
import { findByNodeOrDefault, flatMapPromisesResults, getFlowDetails } from '@flower/utils'
import { findNodeIndex, isSubsetOf } from '@jstream/parser'
import { advanceFlowActionCreator, executeFlowActionCreator } from '@flower/actions'
import { arePathsEqual } from '@parser/utils'

export const executeFlowThunkCreator: ExecuteFlowThunkCreator = reducerSelector => flowIdOrName => (
  dispatch,
  getState,
) => {
  const { flows } = reducerSelector(getState())
  const flow = flows.find(
    flow =>
      ('id' in flowIdOrName && flowIdOrName.id === flow.id) ||
      ('name' in flow && 'name' in flowIdOrName && flow.name === flowIdOrName.name),
  )

  if (!flow) {
    return Promise.resolve([])
  }

  const action = dispatch(
    executeFlowActionCreator({ flowId: flow.id, ...('name' in flow && { flowName: flow.name }), activeFlowId: uuid() }),
  )

  if (!reducerSelector(getState()).activeFlows.some(activeFlow => activeFlow.id === action.payload.activeFlowId)) {
    return Promise.resolve([])
  }

  return dispatch(
    advanceGraphThunkCreator(reducerSelector)(
      advanceFlowActionCreator({
        activeFlowId: action.payload.activeFlowId,
        flowId: flow.id,
        ...('name' in flow && { flowName: flow.name }),
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
    sideEffect => 'nodeIndex' in sideEffect && isSubsetOf(flow.graph[sideEffect.nodeIndex].path, toNode.path),
    rule => !('nodeIndex' in rule),
  )

  const rule = findByNodeOrDefault(
    flow.rules,
    rule => 'nodeIndex' in rule && arePathsEqual(flow.graph[rule.nodeIndex].path, toNode.path),
    rule => !('nodeIndex' in rule),
  )

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
      nextNodeNames.map(findNodeIndex(splitters)(flow.graph)).map(nextNodeIndex =>
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
