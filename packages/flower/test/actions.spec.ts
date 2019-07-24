import {
  advanceFlowActionCreator,
  executeFlowActionCreator,
  finishFlowActionCreator,
  FlowActionType,
  updateConfigActionCreator,
} from '@flower/index'
import { parse } from '@flow/parser'

describe('actions', () => {
  it('1', () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: ['a'],
    })
    expect(updateConfigActionCreator(configuration)).toEqual({
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
        flowId: '1',
      }),
    ).toEqual({
      type: FlowActionType.advanceFlowGraph,
      payload: {
        fromNodeIndex: 1,
        toNodeIndex: 2,
        id: 'id',
        flowId: '1',
      },
    })
  })
  it('3', () => {
    expect(
      advanceFlowActionCreator({
        toNodeIndex: 0,
        id: 'id',
        flowId: '1',
      }),
    ).toEqual({
      type: FlowActionType.advanceFlowGraph,
      payload: {
        toNodeIndex: 0,
        id: 'id',
        flowId: '1',
      },
    })
  })
  it('4', () => {
    expect(
      executeFlowActionCreator({
        flowName: 'a',
        id: 'id',
        flowId: '1',
      }),
    ).toEqual({
      type: FlowActionType.executeFlow,
      payload: {
        flowName: 'a',
        id: 'id',
        flowId: '1',
      },
    })
  })

  it('5', () => {
    expect(
      finishFlowActionCreator({
        id: 'id',
        flowId: '1',
      }),
    ).toEqual({
      type: FlowActionType.finishFlow,
      payload: {
        id: 'id',
        flowId: '1',
      },
    })
  })
  it('6 go directly to node that is not the head', () => {
    expect(
      advanceFlowActionCreator({
        toNodeIndex: 2,
        id: 'id',
        flowId: '1',
      }),
    ).toEqual({
      type: FlowActionType.advanceFlowGraph,
      payload: {
        toNodeIndex: 2,
        id: 'id',
        flowId: '1',
      },
    })
  })
})
