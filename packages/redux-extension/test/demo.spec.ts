import * as actionCreators from 'actions'
import reducer from 'reducer'
import { parse } from '@flow/parser'
import { logger } from 'redux-logger'
import { applyMiddleware, createStore, combineReducers } from 'redux'
import thunk, { ThunkDispatch } from 'redux-thunk'
import { ExecuteFlowThunk, FlowAction, FlowReducerSelector, FlowState } from 'types'

const middleware = applyMiddleware<ThunkDispatch<FlowState, undefined, FlowAction>, FlowState>(thunk, logger)
const store = createStore(combineReducers({ libReducer: reducer }), middleware)

const libSelector: FlowReducerSelector = state => state.libReducer
const config = parse({
  name: 'flow1',
  graph: 'a:b:c',
})

describe('circle', () => {
  it('1', () => {
    store.dispatch(actionCreators.updateConfigActionCreator(config))
    const executeFlowThunkCreator: ExecuteFlowThunk = actionCreators.executeFlowThunkCreator(libSelector)('flow1')

    store.dispatch(executeFlowThunkCreator)
  })
})
