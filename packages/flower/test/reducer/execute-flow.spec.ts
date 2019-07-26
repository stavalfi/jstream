import { parse } from '@flow/parser'
import {
  executeFlowActionCreator,
  finishFlowActionCreator,
  FlowState,
  reducer,
  updateConfigActionCreator,
} from '@flower/index'

const state = (state: FlowState) => state

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
