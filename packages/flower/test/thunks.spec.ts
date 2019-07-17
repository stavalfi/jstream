import { getFlow, getStore, libSelector, state } from '@flower-test/utils'
import { advanceFlowActionCreator, advanceGraphThunk } from '@flower/actions'
import { FlowActionByType, FlowActionType } from '@flower/types'
import { initialState } from '@flower/reducer'
import { parse } from '@flow/parser'

describe('thunks', () => {
  describe('advanceGraphThunk', () => {
    const actions = (actions: FlowActionByType[FlowActionType.advanceFlowGraph][]) => actions

    it('1 - try to advance flow with a signle node', () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: ['a'],
      })
      const flow = getFlow(configuration.flows, 'a')

      const { dispatch, getActions, getState } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            activeNodesIndexes: [],
          },
        ],
        finishedFlows: [],
      })

      return dispatch(
        advanceGraphThunk(libSelector)(advanceFlowActionCreator({ id: '1', flowId: flow.id, toNodeIndex: 0 })),
      ).then(() => {
        expect(getActions()).toEqual(actions([advanceFlowActionCreator({ id: '1', flowId: flow.id, toNodeIndex: 0 })]))
        expect(getState()).toEqual(
          state({
            ...configuration,
            activeFlows: [
              {
                id: '1',
                flowId: flow.id,
                activeNodesIndexes: [0],
              },
            ],
            finishedFlows: [],
          }),
        )
      })
    })

    it('2 - try to advance non-existing flow', () => {
      const { dispatch, getActions, getState } = getStore()

      return dispatch(
        advanceGraphThunk(libSelector)(advanceFlowActionCreator({ id: '1', flowId: '1', toNodeIndex: 0 })),
      ).then(() => {
        expect(getActions()).toEqual(actions([advanceFlowActionCreator({ id: '1', flowId: '1', toNodeIndex: 0 })]))
        expect(getState()).toEqual(state(initialState))
      })
    })

    it('3 - try to advance flow with a two nodes but no rules', () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: [
          {
            name: 'flow1',
            graph: 'a:b',
          },
        ],
      })
      const flow = getFlow(configuration.flows, 'flow1')

      const { dispatch, getActions, getState } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            activeNodesIndexes: [],
          },
        ],
        finishedFlows: [],
      })

      return dispatch(
        advanceGraphThunk(libSelector)(advanceFlowActionCreator({ id: '1', flowId: flow.id, toNodeIndex: 0 })),
      ).then(() => {
        expect(getActions()).toEqual(actions([advanceFlowActionCreator({ id: '1', flowId: flow.id, toNodeIndex: 0 })]))
        expect(getState()).toEqual(
          state({
            ...configuration,
            activeFlows: [
              {
                id: '1',
                flowId: flow.id,
                activeNodesIndexes: [0],
              },
            ],
            finishedFlows: [],
          }),
        )
      })
    })

    it('4 - try to advance flow with a two nodes with specific rule', () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: [
          {
            name: 'flow1',
            graph: 'a:b',
            rules: [
              {
                node_name: 'a',
                next: () => () => () => 'b',
              },
            ],
          },
        ],
      })
      const flow = getFlow(configuration.flows, 'flow1')

      const { dispatch, getActions, getState } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            activeNodesIndexes: [],
          },
        ],
        finishedFlows: [],
      })

      return dispatch(
        advanceGraphThunk(libSelector)(advanceFlowActionCreator({ id: '1', flowId: flow.id, toNodeIndex: 0 })),
      ).then(() => {
        expect(getActions()).toEqual(
          actions([
            advanceFlowActionCreator({ id: '1', flowId: flow.id, toNodeIndex: 0 }),
            advanceFlowActionCreator({ id: '1', flowId: flow.id, flowName: 'flow1', fromNodeIndex: 0, toNodeIndex: 1 }),
          ]),
        )
        expect(getState()).toEqual(
          state({
            ...configuration,
            activeFlows: [
              {
                id: '1',
                flowId: flow.id,
                activeNodesIndexes: [1],
              },
            ],
            finishedFlows: [],
          }),
        )
      })
    })

    it('5 - try to advance flow with a two nodes with generic rule', () => {
      let count = 0
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: [
          {
            name: 'flow1',
            graph: 'a:b',
            rules: [
              {
                next: () => () => () => {
                  if (count === 0) {
                    count++
                    return 'b'
                  } else {
                    return []
                  }
                },
              },
            ],
          },
        ],
      })
      const flow = getFlow(configuration.flows, 'flow1')

      const { dispatch, getActions, getState } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            activeNodesIndexes: [],
          },
        ],
        finishedFlows: [],
      })

      return dispatch(
        advanceGraphThunk(libSelector)(advanceFlowActionCreator({ id: '1', flowId: flow.id, toNodeIndex: 0 })),
      ).then(() => {
        expect(getActions()).toEqual(
          actions([
            advanceFlowActionCreator({ id: '1', flowId: flow.id, toNodeIndex: 0 }),
            advanceFlowActionCreator({ id: '1', flowId: flow.id, flowName: 'flow1', fromNodeIndex: 0, toNodeIndex: 1 }),
          ]),
        )
        expect(getState()).toEqual(
          state({
            ...configuration,
            activeFlows: [
              {
                id: '1',
                flowId: flow.id,
                activeNodesIndexes: [1],
              },
            ],
            finishedFlows: [],
          }),
        )
      })
    })

    it(`6 - assert that we can't advance the same flow twice concurrently`, () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: [
          {
            name: 'flow1',
            graph: 'a:b,c',
            rules: [
              {
                node_name: 'a',
                next: () => () => () => ['b', 'c'],
              },
            ],
          },
        ],
      })
      const flow = getFlow(configuration.flows, 'flow1')

      const { dispatch, getActions, getState } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            activeNodesIndexes: [],
          },
        ],
        finishedFlows: [],
      })

      return dispatch(
        advanceGraphThunk(libSelector)(advanceFlowActionCreator({ id: '1', flowId: flow.id, toNodeIndex: 0 })),
      ).then(() => {
        expect(getActions()).toEqual(actions([advanceFlowActionCreator({ id: '1', flowId: flow.id, toNodeIndex: 0 })]))
        expect(getState()).toEqual(
          state({
            ...configuration,
            activeFlows: [
              {
                id: '1',
                flowId: flow.id,
                activeNodesIndexes: [0],
              },
            ],
            finishedFlows: [],
          }),
        )
      })
    })
  })
})
