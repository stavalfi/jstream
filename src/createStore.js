import {applyMiddleware, compose, createStore} from 'redux';
import middleware from './middleware';
import createReducer from './createReducer';
import {install} from 'redux-loop';

export default (flowsFunctions, workflowsDetails) => {
    const initialState = {
        activeWorkflowsDetails: [],
        nonActiveWorkflowsDetails: []
    };
    return createStore(createReducer(flowsFunctions, workflowsDetails), initialState, compose(install(), applyMiddleware(middleware)));
};