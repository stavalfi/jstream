import {
  advanceFlowActionCreator,
  executeFlowActionCreator,
  finishFlowActionCreator,
  FlowState,
  reducer,
  updateConfigActionCreator,
} from '@flower/index'
import { parse, ParsedFlow } from '@flow/parser'

const state = (state: FlowState) => state

describe('reducer', () => {
  describe('updateConfig', () => {
    it('1 - update config', () => {
      const initialState = {
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
        flows: ['a'],
      })
      const action = updateConfigActionCreator(configuration)
      expect(reducer(initialState, action)).toEqual(
        state({
          splitters: {
            extends: '/',
          },
          flows: configuration.flows,
          activeFlows: [],
          finishedFlows: [],
          advanced: [],
        }),
      )
    })

    it('2 - assert that the activeFlows and finishedFlows are not modified', () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: ['a', 'b'],
      })
      const action = updateConfigActionCreator(configuration)
      const initialState = state({
        splitters: { extends: 'delimiter1' },
        flows: configuration.flows.slice(1),
        activeFlows: [
          {
            id: 'id1',
            flowName: 'a',
            flowId: 'id2',
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requests: [],
              },
            ],
          },
        ],
        finishedFlows: [
          {
            id: 'id2',
            flowName: 'a',
            flowId: 'id2',
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requests: [],
              },
            ],
          },
        ],
        advanced: [],
      })
      expect(reducer(initialState, action)).toEqual(
        state({
          splitters: {
            extends: '/',
          },
          flows: configuration.flows,
          activeFlows: [
            {
              id: 'id1',
              flowName: 'a',
              flowId: 'id2',
              queue: [],
              graphConcurrency: [
                {
                  concurrencyCount: 0,
                  requests: [],
                },
              ],
            },
          ],
          finishedFlows: [
            {
              id: 'id2',
              flowName: 'a',
              flowId: 'id2',
              queue: [],
              graphConcurrency: [
                {
                  concurrencyCount: 0,
                  requests: [],
                },
              ],
            },
          ],
          advanced: [],
        }),
      )
    })

    it('3 - reset the config', () => {
      const initialState = {
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
        flows: ['a'],
      })
      expect(
        reducer(
          reducer(initialState, updateConfigActionCreator(configuration)),
          updateConfigActionCreator({ flows: [], splitters: { extends: '1' } }),
        ),
      ).toEqual(
        state({
          flows: [],
          splitters: { extends: '1' },
          activeFlows: [],
          finishedFlows: [],
          advanced: [],
        }),
      )
    })

    it('4 - assert that the flows that are in use cant be deleted', () => {
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: ['a', 'b'],
      })
      const initialState = state({
        ...configuration,
        activeFlows: [
          {
            id: 'id1',
            flowName: 'a',
            flowId: (configuration.flows.find(f => 'name' in f && f.name === 'a') as ParsedFlow).id,
            queue: [],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requests: [],
              },
            ],
          },
        ],
        finishedFlows: [],
        advanced: [],
      })
      expect(reducer(initialState, updateConfigActionCreator({ flows: [] }))).toEqual(
        state({
          splitters: { extends: '/' },
          flows: configuration.flows.filter(f => 'name' in f && f.name === 'a'),
          activeFlows: [
            {
              id: 'id1',
              flowName: 'a',
              flowId: (configuration.flows.find(f => 'name' in f && f.name === 'a') as ParsedFlow).id,
              queue: [],
              graphConcurrency: [
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
  })
  describe('executeFlow', () => {
    it('1 - execute new flow', () => {
      const initialState = state({
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
        advanced: [],
      })
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: ['a'],
      })
      expect(
        reducer(
          reducer(initialState, updateConfigActionCreator(configuration)),
          executeFlowActionCreator({ flowName: 'a', id: '1' }),
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
              flowId: configuration.flows[0].id,
              queue: [],
              graphConcurrency: [
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
    it('2 - execute a flow that has already been executed with same activeFlow.id', () => {
      const initialState = state({
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
        advanced: [],
      })
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: ['a'],
      })
      expect(
        reducer(
          reducer(
            reducer(initialState, updateConfigActionCreator(configuration)),
            executeFlowActionCreator({ flowName: 'a', id: '1' }),
          ),
          executeFlowActionCreator({ flowName: 'a', id: '1' }),
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
              flowId: configuration.flows[0].id,
              queue: [],
              graphConcurrency: [
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
    it('3 - execute a flow that has already been executed with different activeFlow.id', () => {
      const initialState = state({
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
        advanced: [],
      })
      const configuration = parse({
        splitters: {
          extends: '/',
        },
        flows: ['a'],
      })
      expect(
        reducer(
          reducer(
            reducer(initialState, updateConfigActionCreator(configuration)),
            executeFlowActionCreator({ flowName: 'a', id: '1' }),
          ),
          executeFlowActionCreator({ flowName: 'a', id: '2' }),
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
              flowId: configuration.flows[0].id,
              queue: [],
              graphConcurrency: [
                {
                  concurrencyCount: 0,
                  requests: [],
                },
              ],
            },
            {
              id: '2',
              flowName: 'a',
              flowId: configuration.flows[0].id,
              queue: [],
              graphConcurrency: [
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
    it('4 - execute a flow that has already been finished with same activeFlow.id', () => {
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
        flows: ['a'],
      })
      expect(
        reducer(
          reducer(
            reducer(
              reducer(initialState, updateConfigActionCreator(configuration)),
              executeFlowActionCreator({ flowName: 'a', id: '1' }),
            ),
            finishFlowActionCreator({ id: '1', flowId: configuration.flows[0].id }),
          ),
          executeFlowActionCreator({ flowName: 'a', id: '1' }),
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
              flowName: 'a',
              flowId: configuration.flows[0].id,
              queue: [],
              graphConcurrency: [
                {
                  concurrencyCount: 0,
                  requests: [],
                },
              ],
            },
          ],
          advanced: [],
        }),
      )
    })
  })
  describe('finishFlow', () => {
    it('1 - finish a activeFlow', () => {
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
        flows: ['a'],
      })
      expect(
        reducer(
          reducer(
            reducer(initialState, updateConfigActionCreator(configuration)),
            executeFlowActionCreator({ flowName: 'a', id: '1' }),
          ),
          finishFlowActionCreator({ id: '1', flowId: configuration.flows[0].id }),
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
              flowName: 'a',
              flowId: configuration.flows[0].id,
              queue: [],
              graphConcurrency: [
                {
                  concurrencyCount: 0,
                  requests: [],
                },
              ],
            },
          ],
          advanced: [],
        }),
      )
    })
    it('2 - finish a activeFlow that has already been finished', () => {
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
        flows: ['a'],
      })
      expect(
        reducer(
          reducer(
            reducer(
              reducer(initialState, updateConfigActionCreator(configuration)),
              executeFlowActionCreator({ flowName: 'a', id: '1' }),
            ),
            finishFlowActionCreator({ id: '1', flowId: configuration.flows[0].id }),
          ),
          finishFlowActionCreator({ id: '1', flowId: configuration.flows[0].id }),
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
              flowName: 'a',
              flowId: configuration.flows[0].id,
              queue: [],
              graphConcurrency: [
                {
                  concurrencyCount: 0,
                  requests: [],
                },
              ],
            },
          ],
          advanced: [],
        }),
      )
    })
  })
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
          advanceFlowActionCreator({ id: '1', flowId: flow.id, flowName: flow.name, toNodeIndex: 0 }),
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
              flowId: configuration.flows[0].id,
              queue: [],
              graphConcurrency: [
                {
                  concurrencyCount: 1,
                  requests: [],
                },
              ],
            },
          ],
          finishedFlows: [],
          advanced: [{ id: '1', flowId: flow.id, flowName: flow.name, toNodeIndex: 0 }],
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
      expect(
        reducer(
          reducer(
            reducer(
              reducer(initialState, updateConfigActionCreator(configuration)),
              executeFlowActionCreator({ id: '1', flowName: 'composed-flow' }),
            ),
            advanceFlowActionCreator({ id: '1', flowId: flow.id, flowName: 'composed-flow', toNodeIndex: 0 }),
          ),
          advanceFlowActionCreator({
            id: '1',
            flowId: flow.id,
            flowName: 'composed-flow',
            fromNodeIndex: 0,
            toNodeIndex: 1,
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
                  concurrencyCount: 0,
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
              id: '1',
              flowId: flow.id,
              flowName: 'composed-flow',
              fromNodeIndex: 0,
              toNodeIndex: 1,
            },
          ],
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
      expect(
        reducer(
          reducer(
            reducer(
              reducer(initialState, updateConfigActionCreator(configuration)),
              executeFlowActionCreator({ id: '1', flowName: 'composed-flow' }),
            ),
            advanceFlowActionCreator({ id: '1', flowId: flow.id, flowName: 'composed-flow', toNodeIndex: 0 }),
          ),
          advanceFlowActionCreator({
            id: '1',
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
          advanced: [{ id: '1', flowId: flow.id, flowName: 'composed-flow', toNodeIndex: 0 }],
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
            executeFlowActionCreator({ id: '1', flowName: 'composed-flow' }),
          ),
          advanceFlowActionCreator({ id: '2', flowId: flow.id, flowName: 'composed-flow', toNodeIndex: 0 }),
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
              executeFlowActionCreator({ id: '1', flowName: 'composed-flow' }),
            ),
            finishFlowActionCreator({ id: '1', flowId: flow.id }),
          ),
          advanceFlowActionCreator({ id: '1', flowId: flow.id, flowName: 'composed-flow', toNodeIndex: 0 }),
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
                  requests: [],
                },
                {
                  concurrencyCount: 0,
                  requests: [],
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
      expect(
        reducer(
          reducer(
            reducer(
              reducer(initialState, updateConfigActionCreator(configuration)),
              executeFlowActionCreator({ id: '1', flowName: 'composed-flow' }),
            ),
            advanceFlowActionCreator({ id: '1', flowId: flow.id, flowName: 'composed-flow', toNodeIndex: 0 }),
          ),
          advanceFlowActionCreator({
            id: '1',
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
                  requests: [],
                },
                {
                  concurrencyCount: 0,
                  requests: [],
                },
                {
                  concurrencyCount: 0,
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
          advanced: [{ id: '1', flowId: flow.id, flowName: 'composed-flow', toNodeIndex: 0 }],
        }),
      )
    })

    it(`7 - try to advance twice to head and it has concurrency=1 so fallback to requests`, () => {
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
      expect(
        reducer(
          reducer(
            reducer(
              reducer(initialState, updateConfigActionCreator(configuration)),
              executeFlowActionCreator({ id: '1', flowName: 'a' }),
            ),
            advanceFlowActionCreator({ id: '1', flowId: flow.id, flowName: 'a', toNodeIndex: 0 }),
          ),
          advanceFlowActionCreator({
            id: '1',
            flowId: flow.id,
            flowName: 'a',
            toNodeIndex: 0,
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
              flowName: 'a',
              flowId: flow.id,
              queue: [
                {
                  id: '1',
                  flowId: flow.id,
                  flowName: 'a',
                  toNodeIndex: 0,
                },
              ],
              graphConcurrency: [
                {
                  concurrencyCount: 1,
                  requests: [
                    {
                      id: '1',
                      flowId: flow.id,
                      flowName: 'a',
                      toNodeIndex: 0,
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

    it(`8 - try to advance twice to second node and it has concurrency=1 so fallback to requests`, () => {
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
        advanced: [],
      }
      expect(
        reducer(
          initialState,
          advanceFlowActionCreator({
            id: '1',
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
              queue: [
                {
                  id: '1',
                  flowId: flow.id,
                  flowName: flow.name,
                  fromNodeIndex: 0,
                  toNodeIndex: 1,
                },
              ],
              graphConcurrency: [
                {
                  concurrencyCount: 0,
                  requests: [],
                },
                {
                  concurrencyCount: 1,
                  requests: [
                    {
                      id: '1',
                      flowId: flow.id,
                      flowName: flow.name,
                      fromNodeIndex: 0,
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
            id: '1',
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
              queue: [],
              graphConcurrency: [
                {
                  concurrencyCount: 0,
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
              id: '1',
              flowId: flow.id,
              flowName: flow.name,
              toNodeIndex: 1,
            },
          ],
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
        advanced: [],
      }
      expect(
        reducer(
          initialState,
          advanceFlowActionCreator({
            id: '1',
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
                  id: '1',
                  flowId: flow.id,
                  flowName: flow.name,
                  toNodeIndex: 1,
                },
              ],
              graphConcurrency: [
                {
                  concurrencyCount: 0,
                  requests: [],
                },
                {
                  concurrencyCount: 1,
                  requests: [
                    {
                      id: '1',
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

    it(`11 - try to advance and fallback to a non-empty requests`, () => {
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
            queue: [
              {
                id: '1',
                flowId: flow.id,
                flowName: flow.name,
                toNodeIndex: 1,
              },
            ],
            graphConcurrency: [
              {
                concurrencyCount: 0,
                requests: [],
              },
              {
                concurrencyCount: 1,
                requests: [
                  {
                    id: '1',
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
      }
      expect(
        reducer(
          initialState,
          advanceFlowActionCreator({
            id: '1',
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
                  id: '1',
                  flowId: flow.id,
                  flowName: flow.name,
                  toNodeIndex: 1,
                },
                {
                  id: '1',
                  flowId: flow.id,
                  flowName: flow.name,
                  toNodeIndex: 1,
                },
              ],
              graphConcurrency: [
                {
                  concurrencyCount: 0,
                  requests: [],
                },
                {
                  concurrencyCount: 1,
                  requests: [
                    {
                      id: '1',
                      flowId: flow.id,
                      flowName: flow.name,
                      toNodeIndex: 1,
                    },
                    {
                      id: '1',
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
              id: '1',
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
                    id: '1',
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
                        id: '1',
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
              id: '1',
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
                    id: '1',
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
                        id: '1',
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
              id: '1',
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
                    id: '1',
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
                        id: '1',
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
              id: '1',
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
                    id: '1',
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
                        id: '1',
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
              id: '1',
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
                id: '1',
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
              id: '1',
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
                id: '1',
                flowId: flow.id,
                flowName: flow.name,
                toNodeIndex: 0,
              },
            ],
          }),
        )
      })
    })
  })
})
