import { Flow, UnparsedFlowExtensions } from '@flower/types'
import baseParse, { Splitters, UserConfiguration } from '@jstream/parser'
import parseExtensions from '@flower/parser-extensions'

export const parse = (
  userConfiguration: UserConfiguration<UnparsedFlowExtensions>,
): {
  splitters: Splitters
  flows: Flow[]
} => baseParse(userConfiguration, parseExtensions)

export {
  Rule,
  Flow,
  ParsedRule,
  FlowExtensions,
  UnparsedFlowExtensions,
  RuleResult,
  Request,
  ActiveFlow,
  FlowActionType,
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
export {
  advanceFlowActionCreator,
  executeFlowActionCreator,
  updateConfigActionCreator,
  finishFlowActionCreator,
} from '@flower/actions'
export { executeFlowThunkCreator, advanceGraphThunkCreator } from '@flower/thunks'
export { default as reducer } from '@flower/reducer'
export { default as parseExtensions } from '@flower/parser-extensions'
