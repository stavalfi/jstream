import { getStore as getMockStore } from '@flower-test/utils/utils'
import { Flow, FlowAction, FlowReducerSelector, FlowState, FlowThunkDispatch } from '@flower/index'

export const getStore: (
  initialState?: FlowState,
) => {
  dispatch: FlowThunkDispatch
  getState: () => {
    libReducer: FlowState
  }
  getActions: () => Omit<FlowAction, 'id'>[]
} = getMockStore

export const libSelector: FlowReducerSelector = state => state.libReducer

export const state = (state: FlowState) => ({
  libReducer: state,
})

export function getFlow(flows: Flow[], flowName: string): Flow & { name: string } {
  const flow = flows.find(flow => 'name' in flow && flow.name === flowName)
  expect(flow).not.toBeUndefined()
  if (!flow || !('name' in flow)) {
    // I will never be here but it's for typescript.
    throw new Error('flow is undefined.')
  }
  return flow
}
