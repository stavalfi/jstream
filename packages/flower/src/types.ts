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

type AdvanceFlowGraphOptional = Combinations<{
  fromNodeIndex: number
  flowName: string
}>

export interface FlowActionPayload {
  updateConfig: Configuration<ParsedFlow>
  executeFlow: { activeFlowId: string } & NonEmptyCombinations<{ flowId: string; flowName: string }>
  advanceFlowGraph: { activeFlowId: string; flowId: string; toNodeIndex: number } & AdvanceFlowGraphOptional
  finishFlow: { activeFlowId: String; flowId: string } & Combinations<{ flowName: string }>
}

export type FlowActionCreator<ActionType extends keyof FlowActionPayload> = (
  payload: FlowActionPayload[ActionType],
) => Action<ActionType> & { id: string; payload: FlowActionPayload[ActionType] }

export type FlowActionByType = {
  [ActionType in keyof FlowActionPayload]: Action<ActionType> & {
    id: string
    payload: FlowActionPayload[ActionType]
  }
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
) => (flow: NonEmptyCombinations<{ id: string; name: string }>) => ExecuteFlowThunk

export type Request = Omit<FlowActionByType[FlowActionType.advanceFlowGraph], 'type'>

export type NodeConcurrency = {
  concurrencyCount: number
  requestIds: string[] // actionIds from ActiveFlow.queue
}

export type GraphConcurrency = NodeConcurrency[]

export type ActiveFlow = {
  id: string
  flowId: string
  graphConcurrency: GraphConcurrency
  queue: Request[]
} & Combinations<{ flowName: string }>

export type FlowState = {
  splitters: Splitters
  flows: ParsedFlow[]
  activeFlows: ActiveFlow[]
  finishedFlows: ActiveFlow[]
  advanced: Request[]
}

export type FlowReducer = Reducer<FlowState, FlowAction>

export type FlowReducerSelector<AppState = any> = (state: AppState) => FlowState

export type FlowThunkAction<ReturnValue> = ThunkAction<ReturnValue, FlowState, undefined, FlowAction>

export type FlowThunkDispatch = ThunkDispatch<FlowState, undefined, FlowAction>
