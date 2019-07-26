import {
  executeFlowActionCreator,
  finishFlowActionCreator,
  FlowState,
  reducer,
  updateConfigActionCreator,
} from '@flower/index'
import { parse } from '@flow/parser'

const state = (state: FlowState) => state

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
