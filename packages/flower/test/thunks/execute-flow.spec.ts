import { getFlow, getStore, libSelector } from '@flower-test/utils'
import { advanceFlowActionCreator, executeFlowActionCreator } from '@flower/actions'
import { FlowActionByType, FlowActionType } from '@flower/types'
import { findNodeIndex } from '@jstream/parser'
import { executeFlowThunkCreator } from '@flower/thunks'
import { parse } from '@flower/index'

describe('execute and advance thunk', () => {
  const actions = (actions: FlowActionByType[FlowActionType.advanceFlowGraph | FlowActionType.executeFlow][]) =>
    actions.map(action => ({
      type: action.type,
      flowName: action.flowName,
      payload: action.payload,
    }))

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
      executeFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: getState().libReducer.activeFlows[0].id,
          flowId: flow.id,
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: getState().libReducer.activeFlows[0].id,
          flowId: flow.id,
          toNodeIndex: 0,
        },
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
        flowName: flow.name,
        payload: {
          activeFlowId: getState().libReducer.activeFlows[0].id,
          flowId: flow.id,
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: getState().libReducer.activeFlows[0].id,
          flowId: flow.id,
          toNodeIndex: 0,
        },
      }),
    ])

    expect(actualActions).toEqual(expectedActions)
  })

  it('3 - use rules from other flow', async () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'backup',
          graph: 'backing_up:success,fail',
          default_path: 'success',
          rules: [
            {
              node_name: 'backing_up',
              next: () => () => () => 'success',
              error: () => () => () => 'fail',
            },
          ],
        },
        {
          name: 'add',
          graph: 'adding:[success:backup],fail',
          default_path: 'backup',
          rules: [
            {
              node_name: 'adding',
              next: () => () => () => 'success',
              error: () => () => () => 'fail',
            },
            {
              node_name: 'add/success',
              next: () => () => () => 'backup/backing_up',
            },
          ],
        },
      ],
    })
    const flow = getFlow(configuration.flows, 'add')

    const { dispatch, getActions, getState } = getStore({
      ...configuration,
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    })

    await dispatch(executeFlowThunkCreator(libSelector)(flow))

    const actualActions = getActions()

    const toIndex = findNodeIndex(configuration.splitters)(flow.graph)

    const activeFlow = getState().libReducer.activeFlows[0]

    const expectedActions = actions([
      executeFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          toNodeIndex: toIndex('adding'),
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          fromNodeIndex: toIndex('adding'),
          toNodeIndex: toIndex('add/success'),
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          fromNodeIndex: toIndex('add/success'),
          toNodeIndex: toIndex('backup/backing_up'),
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          fromNodeIndex: toIndex('backup/backing_up'),
          toNodeIndex: toIndex('backup/success'),
        },
      }),
    ])

    expect(actualActions).toEqual(expectedActions)
  })

  it('4 - use rules from extended flow', async () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph: 'start:success,fail',
          default_path: 'success',
          rules: [
            {
              node_name: 'start',
              next: () => () => () => 'success',
              error: () => () => () => 'fail',
            },
          ],
          extends_flows: ['f1'],
        },
      ],
    })
    const flow = getFlow(configuration.flows, 'f1')

    const { dispatch, getActions, getState } = getStore({
      ...configuration,
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    })

    await dispatch(executeFlowThunkCreator(libSelector)(flow))

    const actualActions = getActions()

    const toIndex = findNodeIndex(configuration.splitters)(flow.graph)

    const activeFlow = getState().libReducer.activeFlows[0]

    const expectedActions = actions([
      executeFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          toNodeIndex: toIndex('start'),
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          fromNodeIndex: toIndex('start'),
          toNodeIndex: toIndex('success'),
        },
      }),
    ])

    expect(actualActions).toEqual(expectedActions)
  })

  it('5 - cant find rules in extended flow', async () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph: 'start:success,fail',
          default_path: 'success',
          extends_flows: ['f1'],
        },
      ],
    })
    const flow = getFlow(configuration.flows, 'f1')

    const { dispatch, getActions, getState } = getStore({
      ...configuration,
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    })

    await dispatch(executeFlowThunkCreator(libSelector)(flow))

    const actualActions = getActions()

    const toIndex = findNodeIndex(configuration.splitters)(flow.graph)

    const activeFlow = getState().libReducer.activeFlows[0]

    const expectedActions = actions([
      executeFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          toNodeIndex: toIndex('start'),
        },
      }),
    ])

    expect(actualActions).toEqual(expectedActions)
  })

  it('6 - use rule from other flow', async () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'f1',
          graph: 'start:success,fail',
          default_path: 'success',
          rules: [
            {
              node_name: 'start',
              next: () => () => () => 'success',
            },
          ],
        },
        {
          name: 'f2',
          graph: 'f1',
        },
      ],
    })
    const flow = getFlow(configuration.flows, 'f2')

    const { dispatch, getActions, getState } = getStore({
      ...configuration,
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    })

    await dispatch(executeFlowThunkCreator(libSelector)(flow))

    const actualActions = getActions()

    const toIndex = findNodeIndex(configuration.splitters)(flow.graph)

    const activeFlow = getState().libReducer.activeFlows[0]

    const expectedActions = actions([
      executeFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          toNodeIndex: toIndex('start'),
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          fromNodeIndex: toIndex('start'),
          toNodeIndex: toIndex('success'),
        },
      }),
    ])

    expect(actualActions).toEqual(expectedActions)
  })

  it('7 - use rules from extended flow - long flow', async () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph: 'start:success,fail',
          default_path: 'success',
          rules: [
            {
              node_name: 'start',
              next: () => () => () => 'success',
              error: () => () => () => 'fail',
            },
          ],
          extends_flows: [
            {
              name: 'f3',
              graph: 'f1:f2',
              rules: [
                {
                  node_name: 'f1/success',
                  next: () => () => () => 'f2/start',
                },
              ],
            },
          ],
        },
      ],
    })
    const flow = getFlow(configuration.flows, 'f3')

    const { dispatch, getActions, getState } = getStore({
      ...configuration,
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    })

    await dispatch(executeFlowThunkCreator(libSelector)(flow))

    const actualActions = getActions()

    const toIndex = findNodeIndex(configuration.splitters)(flow.graph)

    const activeFlow = getState().libReducer.activeFlows[0]

    const expectedActions = actions([
      executeFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          toNodeIndex: toIndex('f1/start'),
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          fromNodeIndex: toIndex('f1/start'),
          toNodeIndex: toIndex('f1/success'),
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          fromNodeIndex: toIndex('f1/success'),
          toNodeIndex: toIndex('f2/start'),
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          fromNodeIndex: toIndex('f2/start'),
          toNodeIndex: toIndex('f2/success'),
        },
      }),
    ])

    expect(actualActions).toEqual(expectedActions)
  })

  it('4 - use rules from top level extended flow', async () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph: 'start:success,fail',
          default_path: 'success',
          rules: [
            {
              node_name: 'start',
              next: () => () => () => 'success',
              error: () => () => () => 'fail',
            },
          ],
          extends_flows: [
            'f3',
            'f4',
            {
              graph: 'f2',
              extends_flows: ['f1'],
            },
            'f5',
            'f6',
          ],
        },
      ],
    })
    const flow = getFlow(configuration.flows, 'f1')

    const { dispatch, getActions, getState } = getStore({
      ...configuration,
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    })

    await dispatch(executeFlowThunkCreator(libSelector)(flow))

    const actualActions = getActions()

    const toIndex = findNodeIndex(configuration.splitters)(flow.graph)

    const activeFlow = getState().libReducer.activeFlows[0]

    const expectedActions = actions([
      executeFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          toNodeIndex: toIndex('start'),
        },
      }),
      advanceFlowActionCreator({
        flowName: flow.name,
        payload: {
          activeFlowId: activeFlow.id,
          flowId: flow.id,
          fromNodeIndex: toIndex('start'),
          toNodeIndex: toIndex('success'),
        },
      }),
    ])

    expect(actualActions).toEqual(expectedActions)
  })
})
