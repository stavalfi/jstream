import { getFlowDetails, userInputNodeToNodeIndex } from '@flower/utils'
import { uuid } from '@flow/utils'
import { isSubsetOf } from '@flow/parser'
import {
  AdvanceGraphThunk,
  ExecuteFlowThunkCreator,
  FlowActionByType,
  FlowActionCreator,
  FlowActionType,
  FlowReducerSelector,
  FlowState,
  Request,
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
    advanceGraphThunkCreator(reducerSelector)(
      advanceFlowActionCreator({
        id: action.payload.id,
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

  const flowDetails = getFlowDetails(flows, activeFlows, request.id)
  if (!('flow' in flowDetails) || !('activeFlow' in flowDetails)) {
    return Promise.resolve([])
  }

  const { flow } = flowDetails

  const toNode = flow.graph[request.toNodeIndex]
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
    .then(result => rule && 'next' in rule && rule.next(flow)(toNode, request.toNodeIndex, flow.graph)(result))
    .catch(error => rule && 'error' in rule && rule.error(flow)(toNode, request.toNodeIndex, flow.graph)(error))
    .then(nextNodeNames => (nextNodeNames ? (Array.isArray(nextNodeNames) ? nextNodeNames : [nextNodeNames]) : []))
    .then(nextNodeNames =>
      nextNodeNames
        .map(nodeName =>
          userInputNodeToNodeIndex({
            splitters,
            flows,
            flow,
          })(request.toNodeIndex)(nodeName),
        )
        .map(nextNodeIndex =>
          advanceFlowActionCreator({
            id: request.id,
            flowId: flow.id,
            ...('name' in flow && { flowName: flow.name }),
            fromNodeIndex: request.toNodeIndex,
            toNodeIndex: nextNodeIndex,
          }),
        ),
    )
}

function findByNodeOrDefault<T>(array: T[], predicate: (t1: T) => boolean): T | undefined {
  const element = array.find(predicate)
  return element || array.find(element => !('node' in element))
}

const flatMapPromisesResults = <T>(promises: Promise<T[]>[]): Promise<T[]> =>
  Promise.all(promises).then(array => array.flatMap(array => array))
