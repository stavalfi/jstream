import { FlowState } from '@flower/types'
import { parse, ParsedFlow } from '@jstream/parser'
import { advanceFlowActionCreator } from '@flower/actions'
import { reducer } from '@flower/index'

const state = (state: FlowState) => state

describe('multiple nodes advance to single node', () => {
  it(`1 - advance node to a joined node with actual concurrency=1`, () => {
    const configuration = parse([
      { max_concurrency: 2, graph: 'd' },
      {
        max_concurrency: 2,
        graph: 'a:b,c:d',
      },
    ])
    const flow = configuration.flows.find(flow => !('name' in flow)) as ParsedFlow
    const initialState: FlowState = {
      ...configuration,
      activeFlows: [
        {
          id: '1',
          flowId: flow.id,
          queue: [],
          graphConcurrency: flow.graph.map(node => {
            switch (['a', 'b', 'c', 'd'].find(char => node.path.includes(char))) {
              case 'a':
                return {
                  concurrencyCount: 0,
                  requestIds: [],
                }
              case 'b':
                return {
                  concurrencyCount: 0,
                  requestIds: [],
                }
              case 'c':
                return {
                  concurrencyCount: 1,
                  requestIds: [],
                }
              default:
                // 'd'
                return {
                  concurrencyCount: 1,
                  requestIds: [],
                }
            }
          }),
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    const action2 = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      fromNodeIndex: flow.graph.findIndex(node => node.path.includes('c')),
      toNodeIndex: flow.graph.findIndex(node => node.path.includes('d')),
    })
    const flowState = reducer(initialState, action2)
    expect(flowState).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [],
            graphConcurrency: flow.graph.map(node => {
              switch (['a', 'b', 'c', 'd'].find(char => node.path.includes(char))) {
                case 'a':
                  return {
                    concurrencyCount: 0,
                    requestIds: [],
                  }
                case 'b':
                  return {
                    concurrencyCount: 0,
                    requestIds: [],
                  }
                case 'c':
                  return {
                    concurrencyCount: 0,
                    requestIds: [],
                  }
                default:
                  // 'd'
                  return {
                    concurrencyCount: 2,
                    requestIds: [],
                  }
              }
            }),
          },
        ],
        finishedFlows: [],
        advanced: [action2],
      }),
    )
  })

  it(`2 - try advance to a joined node (node has concurrency=1) and go to requestIds`, () => {
    const configuration = parse([
      {
        max_concurrency: 2,
        graph: 'a:b,c:d',
      },
    ])
    const flow = configuration.flows.find(flow => !('name' in flow)) as ParsedFlow
    const initialState: FlowState = {
      ...configuration,
      activeFlows: [
        {
          id: '1',
          flowId: flow.id,
          queue: [],
          graphConcurrency: flow.graph.map(node => {
            switch (['a', 'b', 'c', 'd'].find(char => node.path.includes(char))) {
              case 'a':
                return {
                  concurrencyCount: 0,
                  requestIds: [],
                }
              case 'b':
                return {
                  concurrencyCount: 0,
                  requestIds: [],
                }
              case 'c':
                return {
                  concurrencyCount: 1,
                  requestIds: [],
                }
              default:
                // 'd'
                return {
                  concurrencyCount: 1,
                  requestIds: [],
                }
            }
          }),
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    const action1 = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      fromNodeIndex: flow.graph.findIndex(node => node.path.includes('c')),
      toNodeIndex: flow.graph.findIndex(node => node.path.includes('d')),
    })
    expect(reducer(initialState, action1)).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [action1],
            graphConcurrency: flow.graph.map(node => {
              switch (['a', 'b', 'c', 'd'].find(char => node.path.includes(char))) {
                case 'a':
                  return {
                    concurrencyCount: 0,
                    requestIds: [],
                  }
                case 'b':
                  return {
                    concurrencyCount: 0,
                    requestIds: [],
                  }
                case 'c':
                  return {
                    concurrencyCount: 0,
                    requestIds: [],
                  }
                default:
                  // 'd'
                  return {
                    concurrencyCount: 1,
                    requestIds: [action1.id],
                  }
              }
            }),
          },
        ],
        finishedFlows: [],
        advanced: [],
      }),
    )
  })

  it(`3 - advance to a joined node (node has concurrency>1)`, () => {
    const configuration = parse({
      flows: [
        {
          graph: 'd',
          max_concurrency: 100,
        },
        {
          graph: 'a:b,c:d',
          max_concurrency: 100,
        },
      ],
    })
    const flow = configuration.flows.find(flow => !('name' in flow)) as ParsedFlow
    const initialState: FlowState = {
      ...configuration,
      activeFlows: [
        {
          id: '1',
          flowId: flow.id,
          queue: [],
          graphConcurrency: flow.graph.map(node => {
            switch (['a', 'b', 'c', 'd'].find(char => node.path.includes(char))) {
              case 'a':
                return {
                  concurrencyCount: 0,
                  requestIds: [],
                }
              case 'b':
                return {
                  concurrencyCount: 0,
                  requestIds: [],
                }
              case 'c':
                return {
                  concurrencyCount: 1,
                  requestIds: [],
                }
              default:
                // 'd'
                return {
                  concurrencyCount: 1,
                  requestIds: [],
                }
            }
          }),
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    const action1 = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      fromNodeIndex: flow.graph.findIndex(node => node.path.includes('c')),
      toNodeIndex: flow.graph.findIndex(node => node.path.includes('d')),
    })
    expect(reducer(initialState, action1)).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [],
            graphConcurrency: flow.graph.map(node => {
              switch (['a', 'b', 'c', 'd'].find(char => node.path.includes(char))) {
                case 'a':
                  return {
                    concurrencyCount: 0,
                    requestIds: [],
                  }
                case 'b':
                  return {
                    concurrencyCount: 0,
                    requestIds: [],
                  }
                case 'c':
                  return {
                    concurrencyCount: 0,
                    requestIds: [],
                  }
                default:
                  // 'd'
                  return {
                    concurrencyCount: 2,
                    requestIds: [],
                  }
              }
            }),
          },
        ],
        finishedFlows: [],
        advanced: [action1],
      }),
    )
  })

  it(`4 - advance one node to a joined node that has multiple same request.payload (but differet request.id)`, () => {
    const configuration = parse([['a:b,c:d', 'd:a']])
    const flow = configuration.flows.find(flow => !('name' in flow)) as ParsedFlow
    const action1 = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      fromNodeIndex: flow.graph.findIndex(node => node.path.includes('b')),
      toNodeIndex: flow.graph.findIndex(node => node.path.includes('d')),
    })
    const action2 = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      fromNodeIndex: flow.graph.findIndex(node => node.path.includes('b')),
      toNodeIndex: flow.graph.findIndex(node => node.path.includes('d')),
    })
    const action3 = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      fromNodeIndex: flow.graph.findIndex(node => node.path.includes('b')),
      toNodeIndex: flow.graph.findIndex(node => node.path.includes('d')),
    })
    const initialState: FlowState = {
      ...configuration,
      activeFlows: [
        {
          id: '1',
          flowId: flow.id,
          queue: [action1, action2, action3],
          graphConcurrency: flow.graph.map(node => {
            switch (['a', 'b', 'c', 'd'].find(char => node.path.includes(char))) {
              case 'a':
                return {
                  concurrencyCount: 0,
                  requestIds: [],
                }
              case 'b':
                return {
                  concurrencyCount: 0,
                  requestIds: [],
                }
              case 'c':
                return {
                  concurrencyCount: 0,
                  requestIds: [],
                }
              default:
                // 'd'
                return {
                  concurrencyCount: 1,
                  requestIds: [action1.id, action2.id, action3.id],
                }
            }
          }),
        },
      ],
      finishedFlows: [],
      advanced: [],
    }
    const action4 = advanceFlowActionCreator({
      activeFlowId: '1',
      flowId: flow.id,
      fromNodeIndex: flow.graph.findIndex(node => node.path.includes('d')),
      toNodeIndex: flow.graph.findIndex(node => node.path.includes('a')),
    })
    expect(reducer(initialState, action4)).toEqual(
      state({
        ...configuration,
        activeFlows: [
          {
            id: '1',
            flowId: flow.id,
            queue: [action2, action3, action4],
            graphConcurrency: flow.graph.map(node => {
              switch (['a', 'b', 'c', 'd'].find(char => node.path.includes(char))) {
                case 'a':
                  return {
                    concurrencyCount: 0,
                    requestIds: [action4.id],
                  }
                case 'b':
                  return {
                    concurrencyCount: 0,
                    requestIds: [],
                  }
                case 'c':
                  return {
                    concurrencyCount: 0,
                    requestIds: [],
                  }
                default:
                  // 'd'
                  return {
                    concurrencyCount: 1,
                    requestIds: [action2.id, action3.id],
                  }
              }
            }),
          },
        ],
        finishedFlows: [],
        advanced: [action1],
      }),
    )
  })

  it(`5 - ensure we can't go directly to node 1 without moving to it from  it's parent`, () => {
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
})
