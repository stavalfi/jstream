// import functions from './workflows.js';
// import workflowsJson from './workflows.json';
// import configuration from '../../../src/index'
// import {logger} from 'redux-logger';
// import {applyMiddleware, createStore, combineReducers} from 'redux';
//
// const {reducer, middlewares, actions} =
//     configuration(workflowsJson, functions, state => state.libReducer);
//
// const middleware = applyMiddleware(...middlewares, logger);
// const store = createStore(combineReducers({libReducer: reducer}), middleware);
//
// store.dispatch(actions.runWorkflow('updateServer', {customParam: 'hi'}));

import parser from '../../../src/v2/parser';
import workflows from './workflows';

console.log(parser(workflows));