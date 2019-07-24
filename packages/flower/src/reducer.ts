import { ActiveFlow, FlowActionPayload, FlowReducer, FlowState, GraphConcurrency, Request } from '@flower/types'
import { ParsedFlow } from '@flow/parser'
import deepEqual from 'fast-deep-equal'
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
      const { id } = action.payload
      const flow = flows.find(flow =>
        'flowName' in action.payload
          ? 'name' in flow && flow.name === action.payload.flowName
          : flow.id === action.payload.flowId,
      )
      if (
        !flow ||
        activeFlows.some(activeflow => activeflow.id === id) ||
        finishedFlows.some(activeflow => activeflow.id === id)
      ) {
        return lastState
      } else {
        return immer(lastState, draft => {
          draft.activeFlows.push({
            id,
            flowId: flow.id,
            ...('name' in flow && { flowName: flow.name }),
            queue: [],
            graphConcurrency: flow.graph.map(() => ({
              concurrencyCount: 0,
              requests: [],
            })),
          })
        })
      }
    }
    case 'advanceFlowGraph': {
      const { id, ...payload } = action.payload

      const flowDetails = getFlowDetails(flows, activeFlows, id)
      if (!('flow' in flowDetails) || !('activeFlow' in flowDetails)) {
        return lastState
      }

      const { flow, activeFlow, activeFlowIndex } = flowDetails

      if (!isValidAdvancePayload(flow, activeFlow, action.payload)) {
        return lastState
      }

      const tempActiveFlow = immer(activeFlow, draft => {
        'fromNodeIndex' in payload && draft.graphConcurrency[payload.fromNodeIndex].concurrencyCount--
        draft.graphConcurrency[payload.toNodeIndex].requests.push(action.payload)
        draft.queue.push(action.payload)
      })

      const { queue, advancing, graphConcurrency } = tempActiveFlow.queue.reduce(
        (
          {
            queue,
            advancing,
            graphConcurrency,
          }: {
            queue: FlowActionPayload['advanceFlowGraph'][]
            advancing: FlowActionPayload['advanceFlowGraph'][]
            graphConcurrency: GraphConcurrency
          },
          request,
        ) => {
          const nodeConcurrency = graphConcurrency[request.toNodeIndex]
          const requestIndex = nodeConcurrency.requests.findIndex(rqst => deepEqual(rqst, request))
          if (
            canAdvance({
              flows,
              flow,
              graphConcurrency,
              toNodeIndex: request.toNodeIndex,
              requestIndex,
            })
          ) {
            return {
              queue,
              advancing: [...advancing, request],
              graphConcurrency: immer(graphConcurrency, draft => {
                draft[request.toNodeIndex].concurrencyCount++
                draft[request.toNodeIndex].requests.splice(requestIndex)
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
      const { id } = action.payload
      const activeFlow = activeFlows.find(activeFlow => activeFlow.id === id)
      if (!activeFlow || !flows.find(flow => flow.id === activeFlow.flowId)) {
        return lastState
      }

      return {
        ...lastState,
        activeFlows: lastState.activeFlows.filter(activeFlow => activeFlow.id !== id),
        finishedFlows: [...lastState.finishedFlows, activeFlow],
      }
    }
  }
  return lastState
}

export default reducer

function isValidAdvancePayload(flow: ParsedFlow, activeFlow: ActiveFlow, payload: Request) {
  if (0 > payload.toNodeIndex || flow.graph.length <= payload.toNodeIndex) {
    return false
  }

  if ('fromNodeIndex' in payload && (0 > payload.fromNodeIndex || payload.fromNodeIndex > flow.graph.length)) {
    return false
  }

  return !(
    'fromNodeIndex' in payload && !flow.graph[payload.fromNodeIndex].childrenIndexes.includes(payload.toNodeIndex)
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
