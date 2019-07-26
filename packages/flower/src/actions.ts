import { FlowActionCreator, FlowActionType } from '@flower/types'

export const updateConfigActionCreator: FlowActionCreator<FlowActionType.updateConfig> = payload => ({
  type: FlowActionType.updateConfig,
  payload,
})

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
