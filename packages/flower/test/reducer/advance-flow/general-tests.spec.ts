import { parse, ParsedFlow } from '@flow/parser'
import { FlowState } from '@flower/types'
import {
  advanceFlowActionCreator,
  executeFlowActionCreator,
  finishFlowActionCreator,
  reducer,
  updateConfigActionCreator,
} from '@flower/index'

const state = (state: FlowState) => state

describe('advanceFlowGraph', () => {
  it('1 - advance Activeflow at the first time', () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: ['a'],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'a') as ParsedFlow & {
      name: string
    }
    const initialState: FlowState = {
      ...configuration,
      activeFlows: [
        {
          id: '1',
          flowName: flow.name,
          flowId: flow.id,
          queue: [],
          graphConcurrency: [
            {
              concurrencyCount: 0,
              requestIds: [],
            },
          ],
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    const action = advanceFlowActionCreator({ activeFlowId: '1', flowId: flow.id, flowName: flow.name, toNodeIndex: 0 })
    expect(reducer(initialState, action)).toEqual(
      state({
        splitters: {
          extends: '/',
        },
        flows: configuration.flows,
        activeFlows: [
          {
            id: '1',
            flowName: 'a',
            flowId: configuration.flows[0].id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 1,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [action],
      }),
    )
  })

  it('2 - advance Activeflow more then once', () => {
    const initialState: FlowState = {
      splitters: { extends: 'delimiter1' },
      flows: [],
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    }
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'composed-flow',
          graph: 'a:b',
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'composed-flow') as ParsedFlow
    const action = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      flowName: 'composed-flow',
      fromNodeIndex: 0,
      toNodeIndex: 1,
    })
    expect(
      reducer(
        reducer(
          reducer(
            reducer(initialState, updateConfigActionCreator(configuration)),
            executeFlowActionCreator({ activeFlowId: '1', flowName: 'composed-flow' }),
          ),
          advanceFlowActionCreator({ activeFlowId: '1', flowId: flow.id, flowName: 'composed-flow', toNodeIndex: 0 }),
        ),
        action,
      ),
    ).toEqual(
      state({
        splitters: {
          extends: '/',
        },
        flows: configuration.flows,
        activeFlows: [
          {
            id: '1',
            flowName: 'composed-flow',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 1,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [action],
      }),
    )
  })

  it('3 - no effect when advance Activeflow from non-active node-index', () => {
    const initialState: FlowState = {
      splitters: { extends: 'delimiter1' },
      flows: [],
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    }
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'composed-flow',
          graph: 'a:b',
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'composed-flow') as ParsedFlow
    const action = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      flowName: 'composed-flow',
      toNodeIndex: 0,
    })
    expect(
      reducer(
        reducer(
          reducer(
            reducer(initialState, updateConfigActionCreator(configuration)),
            executeFlowActionCreator({ activeFlowId: '1', flowName: 'composed-flow' }),
          ),
          action,
        ),
        advanceFlowActionCreator({
          activeFlowId: '1',
          flowId: flow.id,
          flowName: 'composed-flow',
          fromNodeIndex: 1,
          toNodeIndex: 2,
        }),
      ),
    ).toEqual(
      state({
        splitters: {
          extends: '/',
        },
        flows: configuration.flows,
        activeFlows: [
          {
            id: '1',
            flowName: 'composed-flow',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 1,
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
        advanced: [action],
      }),
    )
  })

  it('4 - no effect when advance Activeflow that does not exist', () => {
    const initialState: FlowState = {
      splitters: { extends: 'delimiter1' },
      flows: [],
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    }
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'composed-flow',
          graph: 'a:b',
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'composed-flow') as ParsedFlow
    expect(
      reducer(
        reducer(
          reducer(initialState, updateConfigActionCreator(configuration)),
          executeFlowActionCreator({ activeFlowId: '1', flowName: 'composed-flow' }),
        ),
        advanceFlowActionCreator({ activeFlowId: '2', flowId: flow.id, flowName: 'composed-flow', toNodeIndex: 0 }),
      ),
    ).toEqual(
      state({
        splitters: {
          extends: '/',
        },
        flows: configuration.flows,
        activeFlows: [
          {
            id: '1',
            flowName: 'composed-flow',
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
      }),
    )
  })

  it('5 - no effect when advance Activeflow that finished', () => {
    const initialState: FlowState = {
      splitters: { extends: 'delimiter1' },
      flows: [],
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    }
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'composed-flow',
          graph: 'a:b',
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'composed-flow') as ParsedFlow
    expect(
      reducer(
        reducer(
          reducer(
            reducer(initialState, updateConfigActionCreator(configuration)),
            executeFlowActionCreator({ activeFlowId: '1', flowName: 'composed-flow' }),
          ),
          finishFlowActionCreator({ activeFlowId: '1', flowId: flow.id }),
        ),
        advanceFlowActionCreator({ activeFlowId: '1', flowId: flow.id, flowName: 'composed-flow', toNodeIndex: 0 }),
      ),
    ).toEqual(
      state({
        splitters: {
          extends: '/',
        },
        flows: configuration.flows,
        activeFlows: [],
        finishedFlows: [
          {
            id: '1',
            flowName: 'composed-flow',
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
        advanced: [],
      }),
    )
  })

  it(`6 - no effect when advance Activeflow to a node-index which i can't go to`, () => {
    const initialState: FlowState = {
      splitters: { extends: 'delimiter1' },
      flows: [],
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    }
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'composed-flow',
          graph: 'a:b,c:d',
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'composed-flow') as ParsedFlow
    const action = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      flowName: 'composed-flow',
      toNodeIndex: 0,
    })
    expect(
      reducer(
        reducer(
          reducer(
            reducer(initialState, updateConfigActionCreator(configuration)),
            executeFlowActionCreator({ activeFlowId: '1', flowName: 'composed-flow' }),
          ),
          action,
        ),
        advanceFlowActionCreator({
          activeFlowId: '1',
          flowId: flow.id,
          flowName: 'composed-flow',
          fromNodeIndex: 0,
          toNodeIndex: flow.graph.findIndex(node => node.path.includes('d')),
        }),
      ),
    ).toEqual(
      state({
        splitters: {
          extends: '/',
        },
        flows: configuration.flows,
        activeFlows: [
          {
            id: '1',
            flowName: 'composed-flow',
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 1,
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
              {
                concurrencyCount: 0,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [action],
      }),
    )
  })

  it(`7 - try to advance twice to head and it has concurrency=1 so fallback to requestIds`, () => {
    const initialState: FlowState = {
      splitters: { extends: 'delimiter1' },
      flows: [],
      activeFlows: [],
      finishedFlows: [],
      advanced: [],
    }
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'a',
          graph: 'a',
          max_concurrency: 1,
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'a') as ParsedFlow
    const action = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      flowName: 'a',
      toNodeIndex: 0,
    })
    expect(
      reducer(
        reducer(
          reducer(
            reducer(initialState, updateConfigActionCreator(configuration)),
            executeFlowActionCreator({ activeFlowId: '1', flowName: 'a' }),
          ),
          advanceFlowActionCreator({ activeFlowId: '1', flowId: flow.id, flowName: 'a', toNodeIndex: 0 }),
        ),
        action,
      ),
    ).toEqual(
      state({
        splitters: {
          extends: '/',
        },
        flows: configuration.flows,
        activeFlows: [
          {
            id: '1',
            flowName: 'a',
            flowId: flow.id,
            queue: [action],
            graphConcurrency: [
              {
                concurrencyCount: 1,
                requestIds: [action.id],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      }),
    )
  })

  it(`8 - try to advance twice to second node and it has concurrency=1 so fallback to requestIds`, () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'flow0',
          graph: 'a:b',
          max_concurrency: 2,
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'flow0') as ParsedFlow & {
      name: string
    }
    const initialState: FlowState = {
      ...configuration,
      activeFlows: [
        {
          id: '1',
          flowName: flow.name,
          flowId: flow.id,
          queue: [],
          graphConcurrency: [
            {
              concurrencyCount: 1,
              requestIds: [],
            },
            {
              concurrencyCount: 1,
              requestIds: [],
            },
          ],
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    const action = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      flowName: flow.name,
      fromNodeIndex: 0,
      toNodeIndex: 1,
    })
    expect(reducer(initialState, action)).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowName: flow.name,
            flowId: flow.id,
            queue: [action],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 1,
                requestIds: [action.id],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      }),
    )
  })

  it(`9 - go directly to node 1 without moving to it form node 0`, () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'flow0',
          graph: 'a:b',
          max_concurrency: 2,
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'flow0') as ParsedFlow & {
      name: string
    }
    const initialState: FlowState = {
      ...configuration,
      activeFlows: [
        {
          id: '1',
          flowName: flow.name,
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
    }
    const action = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      flowName: flow.name,
      toNodeIndex: 1,
    })
    expect(reducer(initialState, action)).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowName: flow.name,
            flowId: flow.id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 1,
                requestIds: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [action],
      }),
    )
  })

  it(`10 - go directly to node 1 (with no free concurrency) without moving to it form node 0`, () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'flow0',
          graph: 'a:b',
          max_concurrency: 2,
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'flow0') as ParsedFlow & {
      name: string
    }
    const initialState: FlowState = {
      ...configuration,
      activeFlows: [
        {
          id: '1',
          flowName: flow.name,
          flowId: flow.id,
          queue: [],
          graphConcurrency: [
            {
              concurrencyCount: 0,
              requestIds: [],
            },
            {
              concurrencyCount: 1,
              requestIds: [],
            },
          ],
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    const action = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      flowName: flow.name,
      toNodeIndex: 1,
    })
    expect(reducer(initialState, action)).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowName: flow.name,
            flowId: flow.id,
            queue: [action],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 1,
                requestIds: [action.id],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      }),
    )
  })

  it(`11 - try to advance and fallback to a non-empty requestIds`, () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          name: 'flow0',
          graph: 'a:b',
          max_concurrency: 2,
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'flow0') as ParsedFlow & {
      name: string
    }
    const action1 = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      flowName: flow.name,
      toNodeIndex: 1,
    })
    const initialState: FlowState = {
      ...configuration,
      activeFlows: [
        {
          id: '1',
          flowName: flow.name,
          flowId: flow.id,
          queue: [action1],
          graphConcurrency: [
            {
              concurrencyCount: 0,
              requestIds: [],
            },
            {
              concurrencyCount: 1,
              requestIds: [action1.id],
            },
          ],
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    const action2 = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      flowName: flow.name,
      toNodeIndex: 1,
    })
    expect(reducer(initialState, action2)).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowName: flow.name,
            flowId: flow.id,
            queue: [action1, action2],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [],
              },
              {
                concurrencyCount: 1,
                requestIds: [action1.id, action2.id],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      }),
    )
  })

  it(`12 - try to advance to node with concurrency=0 and fallback to requestIds`, () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph: 'a',
          max_concurrency: 0,
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'a') as ParsedFlow & {
      name: string
    }
    const initialState: FlowState = {
      ...configuration,
      activeFlows: [
        {
          id: '1',
          flowName: flow.name,
          flowId: flow.id,
          queue: [],
          graphConcurrency: [
            {
              concurrencyCount: 0,
              requestIds: [],
            },
          ],
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    const action = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      flowName: flow.name,
      toNodeIndex: 0,
    })
    expect(reducer(initialState, action)).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowName: flow.name,
            flowId: flow.id,
            queue: [action],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requestIds: [action.id],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      }),
    )
  })
})
