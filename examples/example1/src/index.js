import configCreator from './main.flow.js';
import {parse, reducer, actions} from '../../../src';
import {logger} from 'redux-logger';
import {applyMiddleware, createStore, combineReducers} from 'redux';
import thunk from 'redux-thunk';

const middleware = applyMiddleware(thunk, logger);
const store = createStore(combineReducers({libReducer: reducer}), middleware);

const libSelector = state => state.libReducer;
const config = parse(configCreator({}));

store.dispatch(actions.updateConfig(config));
store.dispatch(actions.executeFlowCreator(libSelector)('flow1'));
