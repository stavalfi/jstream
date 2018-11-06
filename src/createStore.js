import {applyMiddleware, compose, createStore} from 'redux';
import middleware from './middleware';
import createReducer from './createReducer';
import {install} from 'redux-loop';

export default (functions, workflowsDetails) => {
    const initialState = {
        activeWorkflowsDetails: [],
        nonActiveWorkflowsDetails: []
    };
    return createStore(createReducer(functions, workflowsDetails), initialState, compose(install(), applyMiddleware(middleware)));
};