import {
  updateConfigActionCreator,
  advanceFlowActionCreator,
  executeFlowActionCreator,
  FlowActionType,
  reducer,
} from '@flower/index'
import { parse } from '@flow/parser'
import { expect } from 'chai'

describe('reducer', () => {
  it('1', () => {
    const initialState = {
      splitters: { extends: 'delimiter1' },
      flows: [],
      activeFlows: [],
    }
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: ['a'],
    })
    const action = updateConfigActionCreator(configuration)
    expect(reducer(initialState, action)).deep.equal({
      splitters: {
        extends: '/',
      },
      flows: configuration.flows,
      activeFlows: [],
    })
  })
  it('2', () => {
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
    }
    expect(reducer(initialState, action)).deep.equal({
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
    })
  })
})
