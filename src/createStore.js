import {applyMiddleware, compose, createStore} from 'redux';
import middleware from './middleware';
import reducer from './recucer';
import {install} from 'redux-loop';

export default (flowsNames, workflowsDetails, flowsFunctions, actions) => {
    const initialState = {
        flowsFunctions,
        flowsNames,
        workflowsDetails,
        activeWorkflowsDetails: [],
        nonActiveWorkflowsDetails: []
    };
    return createStore(reducer(actions), initialState, compose(install(), applyMiddleware(middleware)));
};