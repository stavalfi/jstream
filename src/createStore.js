import {applyMiddleware, compose, createStore} from 'redux';
import middleware from './middleware';
import createReducer from './createReducer';
import {install} from 'redux-loop';

export default (actions, flowsFunctions, workflowsDetails) => {
    const initialState = {
        activeWorkflowsDetails: [],
        nonActiveWorkflowsDetails: []
    };
    return createStore(createReducer(actions, flowsFunctions, workflowsDetails), initialState, compose(install(), applyMiddleware(middleware)));
};