import createReducer from './createReducer';
import {thunk, arrayMiddleware, createFlowSelfResolvedMiddleware} from './middlewares';
import {createRunWorkflowAction} from './actions';
import readWorkflowsFile from './parser';

export default (workflowsJson, functions, stateSelector) => ({
    reducer: createReducer(readWorkflowsFile(workflowsJson).workflowsDetails),
    middlewares: [
        thunk,
        arrayMiddleware,
        createFlowSelfResolvedMiddleware(stateSelector)
    ],
    actions: {
        runWorkflow: createRunWorkflowAction(stateSelector, functions)
    }
});