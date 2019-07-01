import { FlowActionType, FlowReducer, FlowState } from 'types'

const initialState: FlowState = { flows: [], activeFlows: [] }

const reducer: FlowReducer = (lastState = initialState, action) => {
  const { flows, activeFlows } = lastState
  switch (action.type) {
    case FlowActionType.updateConfig:
      return {
        ...lastState,
        ...action.payload,
      }
    case FlowActionType.executeFlow: {
      const { id, flowName } = action.payload
      const flow = flows.find(flow => 'name' in flow && flow.name === flowName)
      if (!flow) {
        return lastState
      } else {
        return {
          ...lastState,
          activeFlows: [
            ...activeFlows,
            {
              id,
              flowName,
              flowId: flow.id,
              activeNodesIndexes: [],
            },
          ],
        }
      }
    }
    case FlowActionType.advanceFlowGraph: {
      const { id, ...payload } = action.payload
      const activeFlowIndex = activeFlows.findIndex(activeFlow => activeFlow.id === id)
      if (activeFlowIndex === -1) {
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
  }
  return lastState
}

export default reducer
