import {
  advanceFlowActionCreator,
  executeFlowActionCreator,
  finishFlowActionCreator,
  FlowActionType,
  updateConfigActionCreator,
} from '@flower/index'
import { parse } from '@flow/parser'
import { expect } from 'chai'

describe('actions', () => {
  it('1', () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: ['a'],
    })
    expect(updateConfigActionCreator(configuration)).deep.equal({
      type: FlowActionType.updateConfig,
      payload: configuration,
    })
  })
  it('2', () => {
    expect(
      advanceFlowActionCreator({
        fromNodeIndex: 1,
        toNodeIndex: 2,
        id: 'id',
      }),
    ).deep.equal({
      type: FlowActionType.advanceFlowGraph,
      payload: {
        fromNodeIndex: 1,
        toNodeIndex: 2,
        id: 'id',
      },
    })
  })
  it('3', () => {
    expect(
      advanceFlowActionCreator({
        toNodeIndex: 2,
        id: 'id',
      }),
    ).deep.equal({
      type: FlowActionType.advanceFlowGraph,
      payload: {
        toNodeIndex: 2,
        id: 'id',
      },
    })
  })
  it('4', () => {
    expect(
      executeFlowActionCreator({
        flowName: 'a',
        id: 'id',
      }),
    ).deep.equal({
      type: FlowActionType.executeFlow,
      payload: {
        flowName: 'a',
        id: 'id',
      },
    })
  })

  it('5', () => {
    expect(
      finishFlowActionCreator({
        id: 'id',
      }),
    ).deep.equal({
      type: FlowActionType.finishFlow,
      payload: {
        id: 'id',
      },
    })
  })
})
