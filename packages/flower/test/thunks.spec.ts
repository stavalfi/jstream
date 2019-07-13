import { getStore, libSelector } from '@flower-test/utils'
import { advanceFlowActionCreator, advanceGraphThunk } from '@flower/index'
// const state = (state: FlowState) => state

describe('thunks', () => {
  describe('advanceGraphThunk', () => {
    // const actions = ({ actions }: { actions: FlowActionByType[FlowActionType.advanceFlowGraph][] }) => {
    //   return actions
    // }
    it('1 - try to advance non-existing flow', () => {
      const store = getStore()
      return store
        .dispatch(advanceGraphThunk(libSelector)(advanceFlowActionCreator({ id: '1', flowId: '1', toNodeIndex: 0 })))
        .then(() => {
          // expect(store.getActions()).toEqual(
          //   actions({ actions: [advanceFlowActionCreator({ id: '1', flowId: '1', toNodeIndex: 0 })] }),
          // )
          // expect(store.getState()).toEqual(state(initialState))
        })
    })
  })
})
