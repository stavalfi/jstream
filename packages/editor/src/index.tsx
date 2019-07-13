import '@editor/fonts/my-symphony.font.js'

import React from 'react'
import ReactDOM from 'react-dom'
import App from '@editor/app'

// @ts-ignore
ReactDOM.render(<App />, document.getElementById('app'))

// import {
//   updateConfigActionCreator,
//   executeFlowThunkCreator,
//   reducer,
//   FlowThunkDispatch,
//   FlowReducerSelector,
//   FlowState,
// } from '@flow/flower'
//
// import { logger } from 'redux-logger'
// import { applyMiddleware, createStore, combineReducers } from 'redux'
// import thunk from 'redux-thunk'
// import { parse } from '@flow/parser'
//
// const middleware = applyMiddleware<FlowThunkDispatch, FlowState>(thunk, logger)
// const store = createStore(combineReducers({ libReducer: reducer }), middleware)
//
// const libSelector: FlowReducerSelector = state => state.libReducer
// const config = parse({
//   name: 'flow1',
//   graph: 'a:b:c',
//   rules: [
//     {
//       node_name: 'a',
//       next: flow => toNode => result => 'b',
//     },
//     {
//       node_name: 'b',
//       next: flow => toNode => result => 'c',
//     },
//   ],
// })
//
// store.dispatch(updateConfigActionCreator(config))
// store.dispatch(executeFlowThunkCreator(libSelector)('flow1'))
