import { FlowState, reducer, updateConfigActionCreator } from '@flower/index'
import { parse, ParsedFlow } from '@flow/parser'

const state = (state: FlowState) => state

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
