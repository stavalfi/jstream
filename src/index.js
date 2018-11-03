import flowStatuses from './statuses/flowStatuses';
import createActions from './createActions';
import createStore from './createStore';
import workflowsJson from '../workflows.json';
import flowsFunctions from '../workflows.js';
import readWorkflowsFile from './workflowsJSONReader';

const {flowsNames, workflowsDetails} = readWorkflowsFile(workflowsJson);

const actions = createActions(flowsNames);
const store = createStore(flowsNames, workflowsDetails, flowsFunctions, actions);

store.dispatch(actions.getUser('wdgh783y83d2', 'createSuperUser', flowStatuses.started));