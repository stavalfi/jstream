// import 'fonts/my-symphony.font.js'
//
// import React from 'react'
// import ReactDOM from 'react-dom'
// import App from 'app'
//
// // @ts-ignore
// ReactDOM.render(<App />, document.getElementById('app'))

// import {
//   updateConfigActionCreator,
//   executeFlowThunkCreator,
//   reducer,
//   FlowThunkDispatch,
//   FlowReducerSelector,
//   FlowState,
// } from '@flow/redux-extention'
import { parse } from '@flow/parser'
console.log(parse)
// import { logger } from 'redux-logger'
// import { applyMiddleware, createStore, combineReducers } from 'redux'
// import thunk  from 'redux-thunk'
//
// const middleware = applyMiddleware<FlowThunkDispatch, FlowState>(thunk, logger)
// const store = createStore(combineReducers({ libReducer: reducer }), middleware)
//
// const libSelector: FlowReducerSelector = state => state.libReducer
// const config = parse({
//   name: 'flow1',
//   graph: 'a:b:c',
// })
//
// store.dispatch(updateConfigActionCreator(config))
// store.dispatch(executeFlowThunkCreator(libSelector)('flow1'))
