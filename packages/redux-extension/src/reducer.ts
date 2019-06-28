import { areNodesEqual, getActiveNodesIndexes } from 'utils'
import { FlowActionType, FlowReducer, FlowState } from 'types'
import { Graph } from '@flow/parser'

const initialState: FlowState = { activeFlows: [], nonActiveWorkflows: [], flows: [] }

const reducer: FlowReducer = (lastState = initialState, action) => {
  const { activeFlows, flows } = lastState
  switch (action.type) {
    case FlowActionType.updateConfig:
      return {
        ...lastState,
        ...action.payload,
        activeFlows: lastState.activeFlows,
        nonActiveWorkflows: lastState.nonActiveWorkflows,
      }
    case FlowActionType.executeFlow: {
      const { flowName, id } = action.payload
      const flow = flows.find(flow => 'name' in flow && flow.name === flowName)
      if (!flow) {
        return lastState
      } else {
        return {
          ...lastState,
          activeFlows: activeFlows.concat([
            {
              ...flow,
              id,
              graph: flow.graph,
            },
          ]),
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
            graph: advance({ graph: activeFlows[activeFlowIndex].graph, ...payload }),
          },
          ...lastState.activeFlows.slice(activeFlowIndex + 1),
        ],
      }
    }
  }
  return lastState
}

type GetToActiveNodeIndex = (
  params: { graph: Graph; toNodeIndex: number } & ({} | { fromNodeIndex: number }),
) => { toActiveNodeIndex: number } & ({} | { fromActiveNodeIndex: number })

const getToActiveNodeIndex: GetToActiveNodeIndex = ({ graph, toNodeIndex, ...rest }) => {
  if ('fromNodeIndex' in rest) {
    const fromActiveNodeIndex = getActiveNodesIndexes(graph).findIndex(activeNodeIndex =>
      areNodesEqual(graph[activeNodeIndex], graph[rest.fromNodeIndex]),
    )
    const toActiveNodeIndex = graph[fromActiveNodeIndex].childrenIndexes.find(childIndex =>
      areNodesEqual(graph[childIndex], graph[toNodeIndex]),
    ) as number
    return { fromActiveNodeIndex, toActiveNodeIndex }
  } else {
    return {
      toActiveNodeIndex: graph.findIndex(activeNode => areNodesEqual(activeNode, graph[toNodeIndex])),
    }
  }
}

export type Advance = (params: { graph: Graph; toNodeIndex: number } & ({} | { fromNodeIndex: number })) => Graph

const advance: Advance = ({ graph, toNodeIndex, ...rest }) => {
  const activeNodeIndexes = getToActiveNodeIndex({ graph, toNodeIndex, ...rest })

  return graph.map((node, i) => {
    if ('fromActiveNodeIndex' in activeNodeIndexes && i === activeNodeIndexes.fromActiveNodeIndex) {
      return {
        ...node,
        status: 'non-active',
      }
    }
    if (i === activeNodeIndexes.toActiveNodeIndex) {
      return {
        ...node,
        status: 'active',
      }
    }
    return node
  })
}

export default reducer
