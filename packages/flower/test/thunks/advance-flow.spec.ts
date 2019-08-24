import { getFlow, getStore, libSelector } from '@flower-test/utils'
import { advanceFlowActionCreator } from '@flower/actions'
import { FlowActionByType, FlowActionType } from '@flower/types'
import { advanceGraphThunkCreator } from '@flower/thunks'
import { parse } from '@flower/index'

describe('advance thunk', () => {
  describe('advanceGraphThunk', () => {
    const actions = (actions: FlowActionByType[FlowActionType.advanceFlowGraph][]) =>
      actions
        .map(action => ({
          flowName: action.flowName,
          type: action.type,
          payload: action.payload,
        }))
        .sort()

    it('1 - try to advance flow with a signle node', async () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: ['a'],
      })
      const flow = getFlow(configuration.flows, 'a')

      const { dispatch, getActions } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      })

      await dispatch(
        advanceGraphThunkCreator(libSelector)(
          advanceFlowActionCreator({
            flowName: flow.name,
            payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
          }),
        ),
      )

      const actualActions = getActions()
      const expectedActions = actions([
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
        }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })

    it('2 - try to advance non-existing flow', async () => {
      const { dispatch, getActions } = getStore()

      await dispatch(
        advanceGraphThunkCreator(libSelector)(
          advanceFlowActionCreator({ flowName: 'dddd', payload: { activeFlowId: '1', flowId: '1', toNodeIndex: 0 } }),
        ),
      )

      const actualActions = getActions()
      const expectedActions = actions([
        advanceFlowActionCreator({ flowName: 'dddd', payload: { activeFlowId: '1', flowId: '1', toNodeIndex: 0 } }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })

    it('3 - try to advance flow with a two nodes but no rules', async () => {
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

      const { dispatch, getActions } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      })

      await dispatch(
        advanceGraphThunkCreator(libSelector)(
          advanceFlowActionCreator({
            flowName: flow.name,
            payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
          }),
        ),
      )

      const actualActions = getActions()
      const expectedActions = actions([
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
        }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })

    it('4 - try to advance flow (containing two nodes) with specific rule', async () => {
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

      const { dispatch, getActions } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      })

      await dispatch(
        advanceGraphThunkCreator(libSelector)(
          advanceFlowActionCreator({
            flowName: flow.name,
            payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
          }),
        ),
      )

      const actualActions = getActions()
      const expectedActions = actions([
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
        }),
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: {
            activeFlowId: '1',
            flowId: flow.id,
            fromNodeIndex: 0,
            toNodeIndex: 1,
          },
        }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })

    it('5 - try to advance flow twice', async () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: [
          {
            name: 'flow1',
            graph: 'a:b:c',
            rules: [
              {
                node_name: 'a',
                next: () => () => () => 'b',
              },
              {
                node_name: 'b',
                next: () => () => () => 'c',
              },
            ],
          },
        ],
      })
      const flow = getFlow(configuration.flows, 'flow1')

      const { dispatch, getActions } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      })

      await dispatch(
        advanceGraphThunkCreator(libSelector)(
          advanceFlowActionCreator({
            flowName: flow.name,
            payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
          }),
        ),
      )

      const actualActions = getActions()
      const expectedActions = actions([
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
        }),
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: {
            activeFlowId: '1',
            flowId: flow.id,
            fromNodeIndex: 0,
            toNodeIndex: 1,
          },
        }),
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: {
            activeFlowId: '1',
            flowId: flow.id,
            fromNodeIndex: 1,
            toNodeIndex: 2,
          },
        }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })

    it(`6 - advance the same flow twice concurrently`, async () => {
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

      const { dispatch, getActions } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      })

      await dispatch(
        advanceGraphThunkCreator(libSelector)(
          advanceFlowActionCreator({
            flowName: flow.name,
            payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
          }),
        ),
      )

      const actualActions = getActions()
      const expectedActions = actions([
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
        }),
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: {
            activeFlowId: '1',
            flowId: flow.id,
            fromNodeIndex: 0,
            toNodeIndex: 1,
          },
        }),
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: {
            activeFlowId: '1',
            flowId: flow.id,
            fromNodeIndex: 0,
            toNodeIndex: 2,
          },
        }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })

    it(`7 - return promise from rule function`, async () => {
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
                next: () => () => () => Promise.resolve(['b', 'c']),
              },
            ],
          },
        ],
      })
      const flow = getFlow(configuration.flows, 'flow1')

      const { dispatch, getActions } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      })

      await dispatch(
        advanceGraphThunkCreator(libSelector)(
          advanceFlowActionCreator({
            flowName: flow.name,
            payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
          }),
        ),
      )

      const actualActions = getActions()
      const expectedActions = actions([
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
        }),
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: {
            activeFlowId: '1',
            flowId: flow.id,
            fromNodeIndex: 0,
            toNodeIndex: 1,
          },
        }),
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: {
            activeFlowId: '1',
            flowId: flow.id,
            fromNodeIndex: 0,
            toNodeIndex: 2,
          },
        }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })

    it('8 - return promise from rule function', async () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: [
          {
            name: 'flow1',
            graph: 'a:b:c',
            rules: [
              {
                node_name: 'a',
                next: () => () => () => Promise.resolve('b'),
              },
              {
                node_name: 'b',
                next: () => () => () => 'c',
              },
            ],
          },
        ],
      })
      const flow = getFlow(configuration.flows, 'flow1')

      const { dispatch, getActions } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      })

      await dispatch(
        advanceGraphThunkCreator(libSelector)(
          advanceFlowActionCreator({
            flowName: flow.name,
            payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
          }),
        ),
      )

      const actualActions = getActions()
      const expectedActions = actions([
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
        }),
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: {
            activeFlowId: '1',
            flowId: flow.id,
            fromNodeIndex: 0,
            toNodeIndex: 1,
          },
        }),
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: {
            activeFlowId: '1',
            flowId: flow.id,
            fromNodeIndex: 1,
            toNodeIndex: 2,
          },
        }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })

    it('9 - throw error in rule function', async () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: [
          {
            name: 'flow1',
            graph: 'a:b:c',
            rules: [
              {
                node_name: 'a',
                next: () => () => () => Promise.resolve('b'),
              },
              {
                node_name: 'b',
                next: () => () => () => {
                  throw new Error('error123')
                },
              },
            ],
          },
        ],
      })
      const flow = getFlow(configuration.flows, 'flow1')

      const { dispatch, getActions } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      })

      await dispatch(
        advanceGraphThunkCreator(libSelector)(
          advanceFlowActionCreator({
            flowName: flow.name,
            payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
          }),
        ),
      )

      const actualActions = getActions()
      const expectedActions = actions([
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
        }),
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: {
            activeFlowId: '1',
            flowId: flow.id,
            fromNodeIndex: 0,
            toNodeIndex: 1,
          },
        }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })

    it('10 - return rejected promise in rule function', async () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: [
          {
            name: 'flow1',
            graph: 'a:b:c',
            rules: [
              {
                node_name: 'a',
                next: () => () => () => Promise.resolve('b'),
              },
              {
                node_name: 'b',
                next: () => () => () => {
                  const error1 = Promise.reject('error123')
                  return error1
                },
              },
            ],
          },
        ],
      })
      const flow = getFlow(configuration.flows, 'flow1')

      const { dispatch, getActions } = getStore({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 0,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      })

      await dispatch(
        advanceGraphThunkCreator(libSelector)(
          advanceFlowActionCreator({
            flowName: flow.name,
            payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
          }),
        ),
      )

      const actualActions = getActions()
      const expectedActions = actions([
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: { activeFlowId: '1', flowId: flow.id, toNodeIndex: 0 },
        }),
        advanceFlowActionCreator({
          flowName: flow.name,
          payload: {
            activeFlowId: '1',
            flowId: flow.id,
            fromNodeIndex: 0,
            toNodeIndex: 1,
          },
        }),
      ])

      expect(actualActions).toEqual(expectedActions)
    })
  })
})
