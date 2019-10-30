import {
  Rule,
  Flow,
  ParsedRule,
  FlowExtensions,
  UnparsedFlowExtensions,
  RuleResult,
  Request,
  ActiveFlow,
  FlowState,
  SideEffect,
  FlowAction,
  FlowReducerSelector,
  FlowThunkAction,
  FlowThunkDispatch,
  AdvanceGraphThunk,
  ExecuteFlowThunk,
  ExecuteFlowThunkCreator,
  FlowActionByType,
  FlowActionCreator,
  FlowActionPayload,
  FlowReducer,
  Func,
  GraphConcurrency,
  NodeConcurrency,
  ParsedSideEffect,
  UnparsedRule,
  UnparsedSideEffect,
} from '@flower/types'
import baseParse, { Splitters, UserConfiguration } from '@jstream/parser'
import parseExtensions from '@flower/parser-extensions'

export const parse = (
  userConfiguration: UserConfiguration<UnparsedFlowExtensions>,
): {
  splitters: Splitters
  flows: Flow[]
} => baseParse(userConfiguration, parseExtensions)

export {
  advanceFlowActionCreator,
  executeFlowActionCreator,
  updateConfigActionCreator,
  finishFlowActionCreator,
} from '@flower/actions'
export { executeFlowThunkCreator, advanceGraphThunkCreator } from '@flower/thunks'
export { default as reducer } from '@flower/reducer'
export { default as parseExtensions } from '@flower/parser-extensions'

export type Rule<T> = Rule<T>
export type Flow = Flow
export type ParsedRule = ParsedRule
export type FlowExtensions = FlowExtensions
export type UnparsedFlowExtensions = UnparsedFlowExtensions
export type RuleResult = RuleResult
export type Request = Request
export type ActiveFlow = ActiveFlow
export { FlowActionType } from '@flower/types'
export type FlowState = FlowState
export type SideEffect<T> = SideEffect<T>
export type FlowAction = FlowAction
export type FlowReducerSelector = FlowReducerSelector
export type FlowThunkAction<T> = FlowThunkAction<T>
export type FlowThunkDispatch = FlowThunkDispatch
export type AdvanceGraphThunk = AdvanceGraphThunk
export type ExecuteFlowThunk = ExecuteFlowThunk
export type ExecuteFlowThunkCreator = ExecuteFlowThunkCreator
export type FlowActionByType = FlowActionByType
export type FlowActionCreator<T extends keyof FlowActionPayload> = FlowActionCreator<T>
export type FlowActionPayload = FlowActionPayload
export type FlowReducer = FlowReducer
export type Func<T, U> = Func<T, U>
export type GraphConcurrency = GraphConcurrency
export type NodeConcurrency = NodeConcurrency
export type ParsedSideEffect = ParsedSideEffect
export type UnparsedRule = UnparsedRule
export type UnparsedSideEffect = UnparsedSideEffect
