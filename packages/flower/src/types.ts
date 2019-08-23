import { Action, Reducer } from 'redux'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import { Configuration, ParsedFlow, Splitters, Node } from '@jstream/parser'
import { Combinations, NonEmptyCombinations } from '@jstream/utils'

export enum FlowActionType {
  updateConfig = 'updateConfig',
  executeFlow = 'executeFlow',
  advanceFlowGraph = 'advanceFlowGraph',
  finishFlow = 'finishFlow',
}

export interface FlowActionPayload {
  updateConfig: Configuration<Flow>
  executeFlow: { activeFlowId: string } & Combinations<{ flowId: string }>
  advanceFlowGraph: { activeFlowId: string; flowId: string; toNodeIndex: number } & Combinations<{
    fromNodeIndex: number
  }>
  finishFlow: { activeFlowId: String; flowId: string } & Combinations<{ flowName: string }>
}

export type FlowActionByType = {
  updateConfig: Action<'updateConfig'> & {
    id: string
    payload: FlowActionPayload['updateConfig']
  }
  executeFlow: Action<'executeFlow'> & {
    id: string
    flowName: string
    payload: FlowActionPayload['executeFlow']
  }
  advanceFlowGraph: Action<'advanceFlowGraph'> & {
    id: string
    flowName: string
    fromNode?: string
    toNode?: string
    payload: FlowActionPayload['advanceFlowGraph']
  }
  finishFlow: Action<'finishFlow'> & {
    id: string
    flowName: string
    payload: FlowActionPayload['finishFlow']
  }
}

export type FlowActionCreator<ActionType extends keyof FlowActionPayload> = (
  params: Omit<FlowActionByType[ActionType], 'id' | 'type'>,
) => FlowActionByType[ActionType]

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
  flows: Flow[]
  activeFlows: ActiveFlow[]
  finishedFlows: ActiveFlow[]
  advanced: Request[]
}

export type FlowReducer = Reducer<FlowState, FlowAction>

export type FlowReducerSelector<AppState = any> = (state: AppState) => FlowState

export type FlowThunkAction<ReturnValue> = ThunkAction<ReturnValue, FlowState, undefined, FlowAction>

export type FlowThunkDispatch = ThunkDispatch<FlowState, undefined, FlowAction>

// extension types:

export type Func<LastParam, Result> = (
  flow: Flow,
) => (toNode: Node, i?: number, graph?: Node[]) => (param: LastParam) => Result | Promise<Result>

export type RuleResult = string | string[]

export type Rule<T extends {}> = T &
  (
    | { next: Func<any, RuleResult>; error: Func<any, RuleResult> }
    | { next: Func<any, RuleResult> }
    | { error: Func<any, RuleResult> })

export type UnparsedRule = Rule<{ node_name: string } | {}>
export type ParsedRule = Rule<{ nodeIndex: number } | {}>

export type SideEffect<T extends {}> = T & { func: Func<any, any> }

export type UnparsedSideEffect = SideEffect<{ node_name: string } | {}>
export type ParsedSideEffect = SideEffect<{ nodeIndex: number } | {}>

export type UnparsedFlowExtensions =
  | {}
  | { max_concurrency: number | boolean }
  | { rules: UnparsedRule[] }
  | { side_effects: UnparsedSideEffect[] }
  | { max_concurrency: number; rules: UnparsedRule[] }
  | { rules: UnparsedRule[]; side_effects: UnparsedSideEffect[] }
  | { max_concurrency: number; side_effects: UnparsedSideEffect[] }
  | { max_concurrency: number; rules: UnparsedRule[]; side_effects: UnparsedSideEffect[] }

export type FlowExtensions = {
  maxConcurrency: number
  rules: ParsedRule[]
  sideEffects: ParsedSideEffect[]
}

export type Flow = ParsedFlow<FlowExtensions>
