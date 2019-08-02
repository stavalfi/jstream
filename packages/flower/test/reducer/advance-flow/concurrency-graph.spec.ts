import { parse, ParsedFlow } from '@jstream/parser'
import { FlowState } from '@flower/types'
import { advanceFlowActionCreator, reducer } from '@flower/index'

const state = (state: FlowState) => state

describe('try to advance in complex concurrency graph', () => {
  it(`1 - fallback to requestIds`, () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph: 'a',
          max_concurrency: 2,
        },
        {
          name: 'flow0',
          graph: 'a:b',
          max_concurrency: 1,
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
                concurrencyCount: 1,
                requestIds: [action.id],
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

  it(`2 - fallback to requetss`, () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph: 'flow0',
          max_concurrency: 1,
          extends_flows: [
            {
              graph: 'flow1',
              max_concurrency: 2,
              extends_flows: [
                {
                  name: 'flow2',
                  graph: 'a:b',
                  max_concurrency: 2,
                },
              ],
            },
          ],
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'flow2') as ParsedFlow & {
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
                concurrencyCount: 1,
                requestIds: [action.id],
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

  it(`3 - fallback to requets`, () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph: 'flow0',
          max_concurrency: 2,
          extends_flows: [
            {
              graph: 'flow1',
              max_concurrency: 2,
              extends_flows: [
                {
                  name: 'flow2',
                  graph: 'a:b', // note: a,b, has implicity max_concurrency === 1
                  max_concurrency: 2,
                },
              ],
            },
          ],
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'flow2') as ParsedFlow & {
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
                concurrencyCount: 1,
                requestIds: [action.id],
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

  it(`4 - try to advance to node (not from any node) when there is no free concurrency and request should be denied`, () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph: 'flow0',
          max_concurrency: 2,
          extends_flows: [
            {
              graph: 'flow1',
              max_concurrency: 2,
              extends_flows: [
                {
                  name: 'flow2',
                  graph: 'a:b',
                  max_concurrency: 2,
                },
              ],
            },
          ],
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'flow2') as ParsedFlow & {
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
              concurrencyCount: 2,
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
                concurrencyCount: 2,
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

  it(`5 - try to advance from node to node with when is no free concurrency and succeed`, () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph: 'flow0',
          max_concurrency: 2,
          extends_flows: [
            {
              graph: 'flow1',
              max_concurrency: 2,
              extends_flows: [
                {
                  name: 'flow2',
                  graph: 'a:b',
                  max_concurrency: 2,
                },
              ],
            },
          ],
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'flow2') as ParsedFlow & {
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
              concurrencyCount: 2,
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
        advanced: [action],
      }),
    )
  })

  it(`6 - advance`, () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph: 'flow0',
          max_concurrency: 2,
          extends_flows: [
            {
              graph: 'flow1',
              max_concurrency: 2,
              extends_flows: [
                {
                  graph: 'a',
                  max_concurrency: 2,
                },
                {
                  name: 'flow2',
                  graph: 'a:b', // note: b, has implicity max_concurrency === 1
                  max_concurrency: 2,
                },
              ],
            },
          ],
        },
      ],
    })
    const flow = configuration.flows.find(flow => 'name' in flow && flow.name === 'flow2') as ParsedFlow & {
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
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 2,
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
})
