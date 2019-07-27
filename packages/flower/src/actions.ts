import { FlowActionCreator, FlowActionType } from '@flower/types'
import { uuid } from '@flow/utils'

export const updateConfigActionCreator: FlowActionCreator<FlowActionType.updateConfig> = payload => ({
  id: uuid(),
  type: FlowActionType.updateConfig,
  payload,
})

export const executeFlowActionCreator: FlowActionCreator<FlowActionType.executeFlow> = payload => ({
  id: uuid(),
  type: FlowActionType.executeFlow,
  payload,
})

export const advanceFlowActionCreator: FlowActionCreator<FlowActionType.advanceFlowGraph> = payload => ({
  id: uuid(),
  type: FlowActionType.advanceFlowGraph,
  payload,
})

export const finishFlowActionCreator: FlowActionCreator<FlowActionType.finishFlow> = payload => ({
  id: uuid(),
  type: FlowActionType.finishFlow,
  payload,
})
