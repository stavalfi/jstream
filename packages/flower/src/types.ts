import { Action, Reducer } from 'redux'
import { Configuration, ParsedFlow, Splitters } from '@flow/parser'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { Combinations, NonEmptyCombinations } from '@flow/utils'

export enum FlowActionType {
  updateConfig = 'updateConfig',
  executeFlow = 'executeFlow',
  advanceFlowGraph = 'advanceFlowGraph',
  finishFlow = 'finishFlow',
}

type FlowActionPayload = {
  updateConfig: Configuration<ParsedFlow>
  executeFlow: { id: string } & NonEmptyCombinations<{ flowId: string; flowName: string }>
  advanceFlowGraph: { id: string; flowId: string; toNodeIndex: number } & Combinations<{
    fromNodeIndex: number
  }> &
    Combinations<{ flowName: string }>
  finishFlow: { id: String; flowId: string } & Combinations<{ flowName: string }>
}

export type FlowActionCreator<ActionType extends keyof FlowActionPayload> = (
  payload: FlowActionPayload[ActionType],
) => Action<ActionType> & { payload: FlowActionPayload[ActionType] }

export type FlowActionByType = {
  [ActionType in keyof FlowActionPayload]: Action<ActionType> & { payload: FlowActionPayload[ActionType] }
}

export type FlowAction = FlowActionByType[keyof FlowActionPayload]

export type AdvanceGraphThunk = ThunkAction<
  Promise<FlowActionByType[FlowActionType.advanceFlowGraph][]>,
  FlowState,
  undefined,
  FlowActionByType[FlowActionType.advanceFlowGraph]
>

export type ExecuteFlowThunk = FlowThunkAction<Promise<FlowActionByType[FlowActionType.advanceFlowGraph][]>>

export type ExecuteFlowThunkCreator = (
  reducerSelector: FlowReducerSelector,
) => (flow: { id: string } & Combinations<{ name: string }>) => ExecuteFlowThunk

export type ActiveFlow = {
  id: string
  flowId: string
  activeNodesIndexes: number[]
} & Combinations<{ flowName: string }>

export type FlowState = {
  splitters: Splitters
  flows: ParsedFlow[]
  activeFlows: ActiveFlow[]
  finishedFlows: ActiveFlow[]
}

export type FlowReducer = Reducer<FlowState, FlowAction>

export type FlowReducerSelector<AppState = any> = (state: AppState) => FlowState

export type FlowThunkAction<ReturnValue> = ThunkAction<ReturnValue, FlowState, undefined, FlowAction>

export type FlowThunkDispatch = ThunkDispatch<FlowState, undefined, FlowAction>
