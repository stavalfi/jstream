import createReducer from './createReducer';
import middlewares from './middlewares';
import {createRunWorkflowAction} from './actions';
import readWorkflowsFile from './parser';

export default (workflowsJson, functions, stateSelector) => ({
    reducer: createReducer(readWorkflowsFile(workflowsJson).workflowsDetails),
    middlewares,
    actions: {
        runWorkflow: createRunWorkflowAction(stateSelector, functions)
    }
});