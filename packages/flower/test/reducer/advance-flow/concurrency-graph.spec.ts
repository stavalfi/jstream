import { parse, ParsedFlow } from '@flow/parser'
import { FlowState } from '@flower/types'
import { advanceFlowActionCreator, reducer } from '@flower/index'

const state = (state: FlowState) => state

describe('try to advance in complex concurrency graph', () => {
  it(`1 - fallback to requests`, () => {
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
              requests: [],
            },
            {
              concurrencyCount: 0,
              requests: [],
            },
          ],
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    expect(
      reducer(
        initialState,
        advanceFlowActionCreator({
          activeFlowId: '1',
          flowId: flow.id,
          flowName: flow.name,
          toNodeIndex: 0,
        }),
      ),
    ).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowName: flow.name,
            flowId: flow.id,
            queue: [
              {
                activeFlowId: '1',
                flowId: flow.id,
                flowName: flow.name,
                toNodeIndex: 0,
              },
            ],
            graphConcurrency: [
              {
                concurrencyCount: 1,
                requests: [
                  {
                    activeFlowId: '1',
                    flowId: flow.id,
                    flowName: flow.name,
                    toNodeIndex: 0,
                  },
                ],
              },
              {
                concurrencyCount: 0,
                requests: [],
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
              requests: [],
            },
            {
              concurrencyCount: 0,
              requests: [],
            },
          ],
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    expect(
      reducer(
        initialState,
        advanceFlowActionCreator({
          activeFlowId: '1',
          flowId: flow.id,
          flowName: flow.name,
          toNodeIndex: 0,
        }),
      ),
    ).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowName: flow.name,
            flowId: flow.id,
            queue: [
              {
                activeFlowId: '1',
                flowId: flow.id,
                flowName: flow.name,
                toNodeIndex: 0,
              },
            ],
            graphConcurrency: [
              {
                concurrencyCount: 1,
                requests: [
                  {
                    activeFlowId: '1',
                    flowId: flow.id,
                    flowName: flow.name,
                    toNodeIndex: 0,
                  },
                ],
              },
              {
                concurrencyCount: 0,
                requests: [],
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
              requests: [],
            },
            {
              concurrencyCount: 0,
              requests: [],
            },
          ],
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    expect(
      reducer(
        initialState,
        advanceFlowActionCreator({
          activeFlowId: '1',
          flowId: flow.id,
          flowName: flow.name,
          toNodeIndex: 0,
        }),
      ),
    ).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowName: flow.name,
            flowId: flow.id,
            queue: [
              {
                activeFlowId: '1',
                flowId: flow.id,
                flowName: flow.name,
                toNodeIndex: 0,
              },
            ],
            graphConcurrency: [
              {
                concurrencyCount: 1,
                requests: [
                  {
                    activeFlowId: '1',
                    flowId: flow.id,
                    flowName: flow.name,
                    toNodeIndex: 0,
                  },
                ],
              },
              {
                concurrencyCount: 0,
                requests: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      }),
    )
  })

  it(`4 - try to advance to node (not from any node) when there is no free concurrency and fallback to requets`, () => {
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
              requests: [],
            },
            {
              concurrencyCount: 0,
              requests: [],
            },
          ],
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    expect(
      reducer(
        initialState,
        advanceFlowActionCreator({
          activeFlowId: '1',
          flowId: flow.id,
          flowName: flow.name,
          toNodeIndex: 1,
        }),
      ),
    ).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowName: flow.name,
            flowId: flow.id,
            queue: [
              {
                activeFlowId: '1',
                flowId: flow.id,
                flowName: flow.name,
                toNodeIndex: 1,
              },
            ],
            graphConcurrency: [
              {
                concurrencyCount: 2,
                requests: [],
              },
              {
                concurrencyCount: 0,
                requests: [
                  {
                    activeFlowId: '1',
                    flowId: flow.id,
                    flowName: flow.name,
                    toNodeIndex: 1,
                  },
                ],
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
              requests: [],
            },
            {
              concurrencyCount: 0,
              requests: [],
            },
          ],
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    expect(
      reducer(
        initialState,
        advanceFlowActionCreator({
          activeFlowId: '1',
          flowId: flow.id,
          flowName: flow.name,
          fromNodeIndex: 0,
          toNodeIndex: 1,
        }),
      ),
    ).toEqual(
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
                requests: [],
              },
              {
                concurrencyCount: 1,
                requests: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [
          {
            activeFlowId: '1',
            flowId: flow.id,
            flowName: flow.name,
            fromNodeIndex: 0,
            toNodeIndex: 1,
          },
        ],
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
              requests: [],
            },
            {
              concurrencyCount: 0,
              requests: [],
            },
          ],
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    expect(
      reducer(
        initialState,
        advanceFlowActionCreator({
          activeFlowId: '1',
          flowId: flow.id,
          flowName: flow.name,
          toNodeIndex: 0,
        }),
      ),
    ).toEqual(
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
                requests: [],
              },
              {
                concurrencyCount: 0,
                requests: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [
          {
            activeFlowId: '1',
            flowId: flow.id,
            flowName: flow.name,
            toNodeIndex: 0,
          },
        ],
      }),
    )
  })
})
