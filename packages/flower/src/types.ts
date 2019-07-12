import { Action, Reducer } from 'redux'
import { Configuration, ParsedFlow, Splitters } from '@flow/parser'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'

export enum FlowActionType {
  updateConfig = 'updateConfig',
  executeFlow = 'executeFlow',
  advanceFlowGraph = 'advanceFlowGraph',
  finishFlow = 'finishFlow',
}

type FlowActionPayload = {
  updateConfig: Configuration<ParsedFlow>
  executeFlow: { id: string; flowName: string }
  advanceFlowGraph: { id: String } & ({ toNodeIndex: number } | { fromNodeIndex: number; toNodeIndex: number })
  finishFlow: { id: String }
}

export type FlowActionCreator<ActionType extends keyof FlowActionPayload> = (
  payload: FlowActionPayload[ActionType],
) => Action<ActionType> & { payload: FlowActionPayload[ActionType] }

export type FlowActionByType = {
  [ActionType in keyof FlowActionPayload]: Action<ActionType> & { payload: FlowActionPayload[ActionType] }
}

export type FlowAction = FlowActionByType[keyof FlowActionPayload]

export type AdvanceGraphThunk = ThunkAction<
  FlowActionByType[FlowActionType.advanceFlowGraph] | Promise<FlowActionByType[FlowActionType.advanceFlowGraph]>,
  FlowState,
  undefined,
  FlowActionByType[FlowActionType.advanceFlowGraph]
>

export type ExecuteFlowThunk = FlowThunkAction<
  FlowActionByType[FlowActionType.advanceFlowGraph] | Promise<FlowActionByType[FlowActionType.advanceFlowGraph]>
>

export type ExecuteFlowThunkCreator = (reducerSelector: FlowReducerSelector) => (flowName: string) => ExecuteFlowThunk

export type ActiveFlow = {
  id: string
  flowName: string
  flowId: string
  activeNodesIndexes: number[]
}

export type FlowState = {
  splitters: Splitters
  flows: ParsedFlow[]
  activeFlows: ActiveFlow[]
}

export type FlowReducer = Reducer<FlowState, FlowAction>

export type FlowReducerSelector<AppState = any> = (state: AppState) => FlowState

export type FlowThunkAction<ReturnValue> = ThunkAction<ReturnValue, FlowState, undefined, FlowAction>

export type FlowThunkDispatch = ThunkDispatch<FlowState, undefined, FlowAction>
