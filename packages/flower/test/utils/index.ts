import { getStore as getMockStore } from '@flower-test/utils/utils'
import { FlowAction, FlowReducerSelector, FlowState, FlowThunkDispatch } from '@flower/index'

export const getStore: (
  initialState?: FlowState,
) => {
  dispatch: FlowThunkDispatch
  getState: () => FlowState
  getActions: () => FlowAction[]
} = getMockStore

export const libSelector: FlowReducerSelector = state => state.libReducer
