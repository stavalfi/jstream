import {
  executeFlowThunkCreator,
  FlowReducerSelector,
  FlowState,
  FlowThunkDispatch,
  reducer,
  updateConfigActionCreator,
} from '@jstream/flower'
import { parse, ParsedFlow } from '@jstream/parser'
import { logger } from 'redux-logger'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import thunk from 'redux-thunk'

const middleware = applyMiddleware<FlowThunkDispatch, FlowState>(thunk, logger)
const store = createStore(combineReducers({ libReducer: reducer }), middleware)

const libSelector: FlowReducerSelector = state => state.libReducer

const config = parse({
  splitters: {
    extends: '/',
  },
  flows: [
    {
      graph: 'start:success,error',
      default_path: 'success',
      rules: [
        {
          node_name: 'start',
          next: () => () => () => 'success',
        },
      ],
      extends_flows: [
        {
          graph: 'add',
          rules: [
            {
              node_name: 'start',
              next: () => () => () => 'error',
            },
          ],
        },
        {
          name: 'all',
          graph: 'add:backup',
          default_path: 'backup',
        },
      ],
    },
  ],
})

store.dispatch(updateConfigActionCreator(config))
const flow = config.flows.find(flow => 'name' in flow && flow.name === 'f3') as ParsedFlow
console.log(flow.graph)
store.dispatch(executeFlowThunkCreator(libSelector)(flow))

// -----

import Editor from '@jstream/editor'
export default Editor
