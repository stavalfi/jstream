import { getStore as getMockStore } from '@flower-test/utils/utils'
import { FlowAction, FlowReducerSelector, FlowState, FlowThunkDispatch } from '@flower/index'
import { ParsedFlow } from '@flow/parser'

export const getStore: (
  initialState?: FlowState,
) => {
  dispatch: FlowThunkDispatch
  getState: () => {
    libReducer: FlowState
  }
  getActions: () => FlowAction[]
} = getMockStore

export const libSelector: FlowReducerSelector = state => state.libReducer

export const state = (state: FlowState) => ({
  libReducer: state,
})

export function getFlow(flows: ParsedFlow[], flowName: string): ParsedFlow & { name: string } {
  const flow = flows.find(flow => 'name' in flow && flow.name === flowName)
  expect(flow).not.toBeUndefined()
  if (!flow || !('name' in flow)) {
    // I will never be here but it's for typescript.
    throw new Error('flow is undefined.')
  }
  return flow
}
