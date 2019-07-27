import { getFlow, getStore, libSelector } from '@flower-test/utils'
import { advanceFlowActionCreator, executeFlowActionCreator } from '@flower/actions'
import { FlowActionByType, FlowActionType } from '@flower/types'
import { parse } from '@flow/parser'
import { executeFlowThunkCreator } from '@flower/thunks'

describe('advance thunk', () => {
  describe('advanceGraphThunk', () => {
    const actions = (actions: FlowActionByType[FlowActionType.advanceFlowGraph | FlowActionType.executeFlow][]) =>
      actions
        .map(action => ({
          type: action.type,
          payload: action.payload,
        }))
        .sort()

    it('1 - excute flow without specifing flow-name', async () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: ['a'],
      })
      const flow = getFlow(configuration.flows, 'a')

      const { dispatch, getActions, getState } = getStore({
        ...configuration,
        activeFlows: [],
        finishedFlows: [],
        advanced: [],
      })

      await dispatch(executeFlowThunkCreator(libSelector)({ id: flow.id }))

      const actualActions = getActions()

      const expectedActions = actions([
        executeFlowActionCreator({ activeFlowId: getState().libReducer.activeFlows[0].id, flowId: flow.id }),
        advanceFlowActionCreator({
          activeFlowId: getState().libReducer.activeFlows[0].id,
          flowId: flow.id,
          flowName: flow.name,
          toNodeIndex: 0,
        }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })

    it('2 - excute flow with specifing flow-name', async () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: ['a'],
      })
      const flow = getFlow(configuration.flows, 'a')

      const { dispatch, getActions, getState } = getStore({
        ...configuration,
        activeFlows: [],
        finishedFlows: [],
        advanced: [],
      })

      await dispatch(executeFlowThunkCreator(libSelector)({ id: flow.id, name: flow.name }))

      const actualActions = getActions()

      const expectedActions = actions([
        executeFlowActionCreator({
          activeFlowId: getState().libReducer.activeFlows[0].id,
          flowId: flow.id,
          flowName: flow.name,
        }),
        advanceFlowActionCreator({
          activeFlowId: getState().libReducer.activeFlows[0].id,
          flowId: flow.id,
          flowName: flow.name,
          toNodeIndex: 0,
        }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })
  })
})
