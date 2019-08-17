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
      name: 'backup',
      graph: 'backing_up:success,fail',
      default_path: 'success',
      rules: [
        {
          node_name: 'backing_up',
          next: () => () => () => 'success',
          error: () => () => () => 'fail',
        },
      ],
      side_effects: [
        {
          node_name: 'backing_up',
          side_effect: flow => toNode => context => {
            console.log('backing up to remote storage....')
          },
        },
      ],
    },
    {
      name: 'add',
      graph: 'adding:[success:backup],fail',
      default_path: 'backup',
      rules: [
        {
          node_name: 'adding',
          next: () => () => () => 'success',
          error: () => () => () => 'fail',
        },
        {
          node_name: 'success',
          next: () => () => () => 'backing_up/backing_up',
        },
        {
          node_name: 'backup/backing_up',
          next: () => () => () => 'backup/backing_up/success',
          error: () => () => () => 'backup/backing_up/fail',
        },
      ],
      side_effects: [
        {
          node_name: 'adding',
          side_effect: flow => toNode => context => {
            console.log('adding to local store....')
          },
        },
        {
          node_name: 'backup/backing_up',
          side_effect: flow => toNode => context => {
            console.log('backing up to remote storage....')
          },
        },
      ],
    },
  ],
})

store.dispatch(updateConfigActionCreator(config))
const flow = config.flows.find(flow => 'name' in flow && flow.name === 'add') as ParsedFlow
console.log(flow.graph)
store.dispatch(executeFlowThunkCreator(libSelector)(flow))

// -----

import Editor from '@jstream/editor'
export default Editor

/*
{
      splitters: {
        extends: '/',
      },
      flows: [
        {
          graph:"start:success",
          default_path:"success",
          extends_flows:[
            {
              name:"all",
              graph:"add:backup",
              default_path:"backup"
            }
            ]
        }
      ],
    }
 */
