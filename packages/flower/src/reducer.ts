import { FlowReducer, FlowState } from '@flower/types'

export const initialState: FlowState = {
  splitters: { extends: '__default_delimiter__' },
  flows: [],
  activeFlows: [],
  finishedFlows: [],
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
        return {
          ...lastState,
          activeFlows: [
            ...activeFlows,
            {
              id,
              flowId: flow.id,
              ...('name' in flow && { flowName: flow.name }),
              activeNodesIndexes: [],
            },
          ],
        }
      }
    }
    case 'advanceFlowGraph': {
      const { id, ...payload } = action.payload
      const activeFlowIndex = activeFlows.findIndex(activeFlow => activeFlow.id === id)
      if (activeFlowIndex === -1) {
        return lastState
      }

      const flow = flows.find(flow => flow.id === activeFlows[activeFlowIndex].flowId)

      if (!flow) {
        return lastState
      }

      const activeFlow = activeFlows[activeFlowIndex]

      if (0 > payload.toNodeIndex || payload.toNodeIndex > flow.graph.length) {
        return lastState
      }

      if ('fromNodeIndex' in payload && !activeFlow.activeNodesIndexes.includes(payload.fromNodeIndex)) {
        return lastState
      }

      if ('fromNodeIndex' in payload && (0 > payload.fromNodeIndex || payload.fromNodeIndex > flow.graph.length)) {
        return lastState
      }

      if (
        'fromNodeIndex' in payload &&
        !flow.graph[payload.fromNodeIndex].childrenIndexes.includes(payload.toNodeIndex)
      ) {
        return lastState
      }

      return {
        ...lastState,
        activeFlows: [
          ...lastState.activeFlows.slice(0, activeFlowIndex),
          {
            ...activeFlows[activeFlowIndex],
            activeNodesIndexes: [
              ...('fromNodeIndex' in payload
                ? activeFlows[activeFlowIndex].activeNodesIndexes.filter(index => index !== payload.fromNodeIndex)
                : activeFlows[activeFlowIndex].activeNodesIndexes),
              payload.toNodeIndex,
            ],
          },
          ...lastState.activeFlows.slice(activeFlowIndex + 1),
        ],
      }
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
