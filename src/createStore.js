import {applyMiddleware, compose, createStore} from 'redux';
import createReducer from './reducer/createReducer';
import {install} from 'redux-loop';

export default (workflowsFunctions, workflowsDetails, ...middlewares) =>
    createStore(
        createReducer(workflowsFunctions, workflowsDetails),
        compose(install(), applyMiddleware(...middlewares))
    );