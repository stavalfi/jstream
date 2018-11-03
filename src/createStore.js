import {applyMiddleware, compose, createStore} from 'redux';
import middleware from './middleware';
import reducer from './recucer';
import {install} from 'redux-loop';

export default (actions, flowsFunctions, workflowsDetails) => {
    const initialState = {
        activeWorkflowsDetails: [],
        nonActiveWorkflowsDetails: []
    };
    return createStore(reducer(actions, flowsFunctions, workflowsDetails), initialState, compose(install(), applyMiddleware(middleware)));
};