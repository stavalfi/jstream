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
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: configuration.flows.slice(1),
        activeFlows: [
          {
            id: 'id1',
            flowName: 'aaa',
            flowId: 'id2',
            activeNodesIndexes: [0, 1, 2],
          },
        ],
        finishedFlows: [
          {
            id: 'id2',
            flowName: 'aaa',
            flowId: 'id2',
            activeNodesIndexes: [0, 1, 2],
          },
        ],
      }
      expect(reducer(initialState, action)).toEqual(
        state({
          splitters: {
            extends: '/',
          },
          flows: configuration.flows,
          activeFlows: [
            {
              id: 'id1',
              flowName: 'aaa',
              flowId: 'id2',
              activeNodesIndexes: [0, 1, 2],
            },
          ],
          finishedFlows: [
            {
              id: 'id2',
              flowName: 'aaa',
              flowId: 'id2',
              activeNodesIndexes: [0, 1, 2],
            },
          ],
        }),
      )
    })

    it('3 - reset the config', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
      const initialState = {
        ...configuration,
        activeFlows: [
          {
            id: 'id1',
            flowName: 'a',
            flowId: (configuration.flows.find(f => 'name' in f && f.name === 'a') as ParsedFlow).id,
            activeNodesIndexes: [],
          },
        ],
        finishedFlows: [],
      }
      expect(reducer(initialState, updateConfigActionCreator({ flows: [] }))).toEqual(
        state({
          splitters: { extends: '/' },
          flows: configuration.flows.filter(f => 'name' in f && f.name === 'a'),
          activeFlows: [
            {
              id: 'id1',
              flowName: 'a',
              flowId: (configuration.flows.find(f => 'name' in f && f.name === 'a') as ParsedFlow).id,
              activeNodesIndexes: [],
            },
          ],
          finishedFlows: [],
        }),
      )
    })
  })
  describe('executeFlow', () => {
    it('1 - execute new flow', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
              activeNodesIndexes: [],
            },
          ],
          finishedFlows: [],
        }),
      )
    })
    it('2 - execute a flow that has already been executed with same activeFlow.id', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
              activeNodesIndexes: [],
            },
          ],
          finishedFlows: [],
        }),
      )
    })
    it('3 - execute a flow that has already been executed with different activeFlow.id', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
              activeNodesIndexes: [],
            },
            {
              id: '2',
              flowName: 'a',
              flowId: configuration.flows[0].id,
              activeNodesIndexes: [],
            },
          ],
          finishedFlows: [],
        }),
      )
    })
    it('4 - execute a flow that has already been finished with same activeFlow.id', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
              activeNodesIndexes: [],
            },
          ],
        }),
      )
    })
  })
  describe('finishFlow', () => {
    it('1 - finish a activeFlow', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
              activeNodesIndexes: [],
            },
          ],
        }),
      )
    })
    it('2 - finish a activeFlow that has already been finished', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
              activeNodesIndexes: [],
            },
          ],
        }),
      )
    })
  })
  describe('advanceFlowGraph', () => {
    it('1 - advance Activeflow at the first time', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
          advanceFlowActionCreator({ id: '1', flowId: configuration.flows[0].id, flowName: 'a', toNodeIndex: 0 }),
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
              activeNodesIndexes: [0],
            },
          ],
          finishedFlows: [],
        }),
      )
    })

    it('2 - advance Activeflow more then once', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
              activeNodesIndexes: [1],
            },
          ],
          finishedFlows: [],
        }),
      )
    })

    it('3 - no effect when advance Activeflow from non-active node-index', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
              activeNodesIndexes: [0],
            },
          ],
          finishedFlows: [],
        }),
      )
    })

    it('4 - no effect when advance Activeflow that does not exist', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
              activeNodesIndexes: [],
            },
          ],
          finishedFlows: [],
        }),
      )
    })

    it('5 - no effect when advance Activeflow that finished', () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
              activeNodesIndexes: [],
            },
          ],
        }),
      )
    })

    it(`6 - no effect when advance Activeflow to a node-index which i can't go to`, () => {
      const initialState = {
        splitters: { extends: 'delimiter1' },
        flows: [],
        activeFlows: [],
        finishedFlows: [],
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
              activeNodesIndexes: [0],
            },
          ],
          finishedFlows: [],
        }),
      )
    })
  })
})
