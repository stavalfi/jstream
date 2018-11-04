import {workflowActionCreator} from './actionsCreators';
import createStore from './createStore';
import workflowsJson from '../workflows.json';
import flowsFunctions from '../workflows.js';
import readWorkflowsFile from './workflowsJSONReader';

const {workflowsDetails} = readWorkflowsFile(workflowsJson);

const store = createStore(flowsFunctions, workflowsDetails);

store.dispatch(workflowActionCreator('createUser'));

refactoring:
    * replaced multiple actions creators functions with a single action creator function.
* removed unused imports and parameters from functions.
* start a workflow by a unique action that does not complete any flow. it will dispatch the first flow, create the workflow in state.activeWorkflows and nothing more.
* added complete date to the workflow.