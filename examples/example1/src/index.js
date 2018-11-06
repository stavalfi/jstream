import createStore from '../../../src/createStore';
import {startWorkflowAction} from '../../../src/actions';
import readWorkflowsFile from '../../../src/workflowsJSONReader';
import workflowsJson from './workflows.json';
import functions from './workflows.js';

const {workflowsDetails} = readWorkflowsFile(workflowsJson);

const store = createStore(functions, workflowsDetails);

store.dispatch(startWorkflowAction('createUser'));