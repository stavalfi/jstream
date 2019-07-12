import { Action, Reducer } from 'redux'
import { Configuration, ParsedFlow, Splitters } from '@flow/parser'
import { ThunkAction, ThunkDispatch } from 'redux-thunk'

export enum FlowActionType {
  updateConfig = 'update-config',
  executeFlow = 'execute-flow',
  advanceFlowGraph = 'advance-flow-graph',
  finishFlow = 'finish-flow',
}

export type UpdateConfigAction = Action<FlowActionType.updateConfig> & { payload: Configuration<ParsedFlow> }

export type UpdateConfigActionCreator = (payload: Configuration<ParsedFlow>) => UpdateConfigAction

export type ExecuteFlowPayload = { id: string; flowName: string }

export type ExecuteFlowAction = Action<FlowActionType.executeFlow> & { payload: ExecuteFlowPayload }

export type ExecuteFlowActionCreator = (payload: ExecuteFlowPayload) => ExecuteFlowAction

export type AdvanceFlowPayload = Pick<ExecuteFlowPayload, 'id'> &
  ({ toNodeIndex: number } | { fromNodeIndex: number; toNodeIndex: number })

export type AdvanceFlowAction = Action<FlowActionType.advanceFlowGraph> & { payload: AdvanceFlowPayload }

export type AdvanceFlowActionCreator = (payload: AdvanceFlowPayload) => AdvanceFlowAction

export type FinishFlowPayload = Pick<ExecuteFlowPayload, 'id'>

export type FinishFlowAction = Action<FlowActionType.finishFlow> & { payload: FinishFlowPayload }

export type FinishFlowActionCreator = (payload: FinishFlowPayload) => FinishFlowAction

export type FlowAction = AdvanceFlowAction | ExecuteFlowAction | UpdateConfigAction | FinishFlowAction

export type AdvanceGraphThunk = ThunkAction<
  AdvanceFlowAction | Promise<AdvanceFlowAction>,
  FlowState,
  undefined,
  AdvanceFlowAction
>

export type ExecuteFlowThunk = FlowThunkAction<AdvanceFlowAction | Promise<AdvanceFlowAction>>

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
