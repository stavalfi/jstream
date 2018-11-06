import createStore from '../../../src/createStore';
import {startWorkflowAction} from '../../../src/actions';
import readWorkflowsFile from '../../../src/workflowsJSONReader';
import workflowsJson from './workflows.json';
import flowsFunctions from './workflows.js';
const {workflowsDetails} = readWorkflowsFile(workflowsJson);

const store = createStore(flowsFunctions, workflowsDetails);

store.dispatch(startWorkflowAction('createSuperUser'));