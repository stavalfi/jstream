import createStore from '../../../src/createStore';
import {startWorkflowAction as startWorkflowActionCreator, cancelWorkflowAction} from '../../../src/actions';
import readWorkflowsFile from '../../../src/json/parser';
import workflowsJson from './workflows.json';
import workflowsFunctions from './workflows.js';
import middleware from './middleware';

const {workflowsDetails} = readWorkflowsFile(workflowsJson);

const store = createStore(workflowsFunctions, workflowsDetails, middleware);

const startWorkflowAction = startWorkflowActionCreator('createUser');
store.dispatch(startWorkflowAction);
store.dispatch(cancelWorkflowAction(startWorkflowAction.workflowId));