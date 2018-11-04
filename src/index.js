import {startWorkflowAction} from './actions';
import createStore from './createStore';
import workflowsJson from '../workflows.json';
import flowsFunctions from '../workflows.js';
import readWorkflowsFile from './workflowsJSONReader';

const {workflowsDetails} = readWorkflowsFile(workflowsJson);

const store = createStore(flowsFunctions, workflowsDetails);

store.dispatch(startWorkflowAction('createSuperUser'));
