import { ActiveFlow, FlowReducer, FlowState, GraphConcurrency, Request } from '@flower/types'
import { ParsedFlow } from '@flow/parser'
import immer from 'immer'
import { getFlowDetails } from '@flower/utils'

export const initialState: FlowState = {
  splitters: { extends: '__default_delimiter__' },
  flows: [],
  activeFlows: [],
  finishedFlows: [],
  advanced: [],
}

const reducer: FlowReducer = (lastState = initialState, action) => {
  const { flows, activeFlows, finishedFlows } = lastState
  switch (action.type) {
    case 'updateConfig': {
      const flowsInUse = [
        ...flows.filter(flow => activeFlows.some(activeFlow => activeFlow.flowId === flow.id)),
        ...flows.filter(flow => finishedFlows.some(activeFlow => activeFlow.flowId === flow.id)),
      ]
      const flowsInUseIds = flowsInUse.map(flow => flow.id)
      const updatedFlows = action.payload.flows.filter(flow => !flowsInUseIds.includes(flow.id)).concat(flowsInUse)

      return {
        ...lastState,
        ...action.payload,
        flows: updatedFlows,
        activeFlows: lastState.activeFlows,
      }
    }
    case 'executeFlow': {
      const { activeFlowId } = action.payload
      const flow = flows.find(flow =>
        'flowName' in action.payload
          ? 'name' in flow && flow.name === action.payload.flowName
          : flow.id === action.payload.flowId,
      )
      if (
        !flow ||
        activeFlows.some(activeflow => activeflow.id === activeFlowId) ||
        finishedFlows.some(activeflow => activeflow.id === activeFlowId)
      ) {
        return lastState
      } else {
        return immer(lastState, draft => {
          draft.activeFlows.push({
            id: activeFlowId,
            flowId: flow.id,
            ...('name' in flow && { flowName: flow.name }),
            queue: [],
            graphConcurrency: flow.graph.map(() => ({
              concurrencyCount: 0,
              requestIds: [],
            })),
          })
        })
      }
    }
    case 'advanceFlowGraph': {
      const { activeFlowId, ...payload } = action.payload

      const flowDetails = getFlowDetails(flows, activeFlows, activeFlowId)
      if (!('flow' in flowDetails) || !('activeFlow' in flowDetails)) {
        return lastState
      }

      const { flow, activeFlow, activeFlowIndex } = flowDetails

      if (!isValidAdvancePayload(flow, activeFlow, action)) {
        return lastState
      }

      const tempActiveFlow = immer(activeFlow, draft => {
        'fromNodeIndex' in payload && draft.graphConcurrency[payload.fromNodeIndex].concurrencyCount--
        draft.graphConcurrency[payload.toNodeIndex].requestIds.push(action.id)
        draft.queue.push(action)
      })

      const { queue, advancing, graphConcurrency } = tempActiveFlow.queue.reduce(
        (
          {
            queue,
            advancing,
            graphConcurrency,
          }: {
            queue: ActiveFlow['queue']
            advancing: FlowState['advanced']
            graphConcurrency: GraphConcurrency
          },
          request,
        ) => {
          const nodeConcurrency = graphConcurrency[request.payload.toNodeIndex]
          const requestIndex = nodeConcurrency.requestIds.findIndex(actionId => request.id === actionId)
          if (
            canAdvance({
              flows,
              flow,
              graphConcurrency,
              toNodeIndex: request.payload.toNodeIndex,
              requestIndex,
            })
          ) {
            return {
              queue,
              advancing: [...advancing, request],
              graphConcurrency: immer(graphConcurrency, draft => {
                draft[request.payload.toNodeIndex].concurrencyCount++
                draft[request.payload.toNodeIndex].requestIds.splice(requestIndex)
              }),
            }
          } else {
            return { queue: [...queue, request], advancing, graphConcurrency }
          }
        },
        {
          queue: [],
          advancing: [],
          graphConcurrency: tempActiveFlow.graphConcurrency,
        },
      )

      return immer(lastState, draft => {
        draft.activeFlows[activeFlowIndex].queue = queue
        draft.activeFlows[activeFlowIndex].graphConcurrency = graphConcurrency
        draft.advanced = advancing
      })
    }
    case 'finishFlow': {
      const { activeFlowId } = action.payload
      const activeFlow = activeFlows.find(activeFlow => activeFlow.id === activeFlowId)
      if (!activeFlow || !flows.find(flow => flow.id === activeFlow.flowId)) {
        return lastState
      }

      return {
        ...lastState,
        activeFlows: lastState.activeFlows.filter(activeFlow => activeFlow.id !== activeFlowId),
        finishedFlows: [...lastState.finishedFlows, activeFlow],
      }
    }
  }
  return lastState
}

export default reducer

function isValidAdvancePayload(flow: ParsedFlow, activeFlow: ActiveFlow, request: Request) {
  if (0 > request.payload.toNodeIndex || flow.graph.length <= request.payload.toNodeIndex) {
    return false
  }

  if (
    'fromNodeIndex' in request.payload &&
    (0 > request.payload.fromNodeIndex || request.payload.fromNodeIndex > flow.graph.length)
  ) {
    return false
  }

  return !(
    'fromNodeIndex' in request.payload &&
    !flow.graph[request.payload.fromNodeIndex].childrenIndexes.includes(request.payload.toNodeIndex)
  )
}

type CanAdvance = (params: {
  flows: ParsedFlow[]
  flow: ParsedFlow
  graphConcurrency: ActiveFlow['graphConcurrency']
  toNodeIndex: number
  requestIndex: number
}) => boolean

const canAdvance: CanAdvance = ({ flows, flow, graphConcurrency, toNodeIndex, requestIndex }) => {
  if (requestIndex !== 0) {
    return false
  }
  if (!('name' in flow)) {
    const { maxConcurrency } = flow
    const actualConcurrency = graphConcurrency.reduce((sum, { concurrencyCount }) => sum + concurrencyCount, 0)
    if (actualConcurrency + 1 > maxConcurrency) {
      return false
    }
  }

  // const didAllParentsAdvanced = flow.graph[toNodeIndex].parentsIndexes.every(parentIndex =>
  //   graphConcurrency[toNodeIndex].requestIds.find(
  //     request => 'fromNodeIndex' in request && request.fromNodeIndex === parentIndex,
  //   ),
  // )
  //
  // if (!didAllParentsAdvanced) {
  //   return false
  // }

  return flow.graph[toNodeIndex].path.every((flowName, i) => {
    const subFlow = flows.find(flow => 'name' in flow && flow.name === flowName)
    if (!subFlow) {
      return false
    }
    const actualConcurrency = getConcurrencyCountOfGroup({
      graphConcurrency: graphConcurrency,
      pathsGroups: flow.pathsGroups,
      groupId: flow.pathsGroups[toNodeIndex][i],
    })
    return actualConcurrency + 1 <= subFlow.maxConcurrency
  })
}

type GetConcurrencyCountOfGroup = (params: {
  graphConcurrency: ActiveFlow['graphConcurrency']
  pathsGroups: ParsedFlow['pathsGroups']
  groupId: string
}) => number

const getConcurrencyCountOfGroup: GetConcurrencyCountOfGroup = ({ graphConcurrency, pathsGroups, groupId }) => {
  return pathsGroups.reduce((sum, pathGroups, i) => {
    if (pathGroups.includes(groupId)) {
      return sum + graphConcurrency[i].concurrencyCount
    } else {
      return sum
    }
  }, 0)
}
