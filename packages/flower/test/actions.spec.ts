import {
  advanceFlowActionCreator,
  executeFlowActionCreator,
  finishFlowActionCreator,
  FlowActionType,
  updateConfigActionCreator,
} from '@flower/index'
import { parse } from '@jstream/parser'

describe('actions', () => {
  it('1', () => {
    const configuration = parse({
      splitters: {
        extends: '/',
      },
      flows: ['a'],
    })
    const action = updateConfigActionCreator({ payload: configuration })
    expect(action).toEqual({
      id: action.id,
      type: FlowActionType.updateConfig,
      payload: configuration,
    })
  })
  it('2', () => {
    const action = advanceFlowActionCreator({
      payload: {
        fromNodeIndex: 1,
        toNodeIndex: 2,
        activeFlowId: 'id',
        flowId: '1',
      },
    })
    expect(action).toEqual({
      id: action.id,

      type: FlowActionType.advanceFlowGraph,
      payload: {
        fromNodeIndex: 1,
        toNodeIndex: 2,
        activeFlowId: 'id',
        flowId: '1',
      },
    })
  })
  it('3', () => {
    const action = advanceFlowActionCreator({
      payload: {
        toNodeIndex: 0,
        activeFlowId: 'id',
        flowId: '1',
      },
    })
    expect(action).toEqual({
      id: action.id,
      type: FlowActionType.advanceFlowGraph,
      payload: {
        toNodeIndex: 0,
        activeFlowId: 'id',
        flowId: '1',
      },
    })
  })
  it('4', () => {
    const action = executeFlowActionCreator({
      flowName: 'a',
      payload: {
        activeFlowId: 'id',
        flowId: '1',
      },
    })
    expect(action).toEqual({
      id: action.id,
      flowName: 'a',
      type: FlowActionType.executeFlow,
      payload: {
        activeFlowId: 'id',
        flowId: '1',
      },
    })
  })

  it('5', () => {
    const action = finishFlowActionCreator({
      payload: {
        activeFlowId: 'id',
        flowId: '1',
      },
    })
    expect(action).toEqual({
      id: action.id,
      type: FlowActionType.finishFlow,
      payload: {
        activeFlowId: 'id',
        flowId: '1',
      },
    })
  })
  it('6 go directly to node that is not the head', () => {
    const action = advanceFlowActionCreator({
      payload: {
        toNodeIndex: 2,
        activeFlowId: 'id',
        flowId: '1',
      },
    })
    expect(action).toEqual({
      id: action.id,
      type: FlowActionType.advanceFlowGraph,
      payload: {
        toNodeIndex: 2,
        activeFlowId: 'id',
        flowId: '1',
      },
    })
  })
})
