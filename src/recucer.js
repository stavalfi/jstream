import flowStatuses from './statuses/flowStatuses';
import workflowStatuses from './statuses/workflowStatuses';
import {loop, Cmd} from 'redux-loop';
// import flowsFunctions from 'workflows';
// import actions from './actions';
import {flowsNames, workflowsDetails} from './workflowsJSONReader';

const isActionValid = (state, action) => {
    if (action.type !== 'COMPLETED_STATUS')
        return false;

    if (!state.flowsNames.some(flowName => flowName === action.flowName))
        return false;

    if (!state.workflowsDetails.some(workflowDetails => workflowDetails.workflowName === action.workflowName))
        return false;

    if (!Object.values(flowStatuses).some(flowStatus => flowStatus === action.flowStatus))
        return false;

    if (state.nonActiveWorkflowsDetails.some(workflowDetails => workflowDetails.workflowId === action.workflowId))
    // throw error because we try to modify not-active workflow.
        return false;

    return true;
};

const isStatusLegalInThisWorkflow = (activeWorkflowDetails, flowName, flowStatus) =>
    activeWorkflowDetails + flowName + flowStatus;

const isWorkflowCompleted = activeWorkflowDetails => activeWorkflowDetails;

const getActionsToTrigger = activeWorkflowDetails => [activeWorkflowDetails].slice(0, 0);

const initialState = {
    flowsNames,
    workflowsDetails,
    activeWorkflowsDetails: [],
    nonActiveWorkflowsDetails: []
};

export default (state = initialState, action) => {
    if (!isActionValid(state, action))
        return state;

    const workflowDetails = state.workflowsDetails.filter(workflow => workflow.workflowName === action.workflowName);

    if (workflowDetails.length === 0)
    // the workflow does not exist by the given name in the action.
        return state;

    const activeWorkflowDetails = state.activeWorkflowsDetails.filter(activeWorkflow => activeWorkflow.workflowId === action.workflowId);

    if (activeWorkflowDetails.length === 0) {
        if (action.flowStatus !== flowStatuses.started)
        // the workflow has not stated yet and the user notify about finished flowStatus that is not the first flowStatus.
            return state;
        if (action.flowName !== workflowDetails[0].workflow[0])
        // we just started this workflow but the first flow does not match to the given flow in the action.
            return state;

        // we need to create this workflow
        const newActiveWorkflow = {
            workflowId: action.workflowId,
            workflow: workflowDetails[0].workflow,
            workflowStatus: workflowStatuses.started,
            workflowStatuses: [
                {
                    flowStatusCompleteTime: action.flowStatusCompleteTime,
                    flowStatus: flowStatuses.started,
                    flowName: action.flowName
                }
            ]
        };
        return loop(
            {
                ...state,
                activeWorkflowsDetails: [...state.activeWorkflowsDetails, newActiveWorkflow],
            },
            Cmd.list(getActionsToTrigger(newActiveWorkflow))
        );
    }

    // we need to check that the flowStatus that completed was executed in the right time.

    if (!isStatusLegalInThisWorkflow(activeWorkflowDetails, action.flowName, action.flowStatus))
    // the user notified about completed flowStatus that is not supposed to complete now or never.
    // TODO: understand why this flowStatus is not legal and add documentation.
        return state;

    const updatedActiveWorkflowDetails = {
        ...activeWorkflowDetails,
        workflowStatuses: [
            ...activeWorkflowDetails.workflowStatuses,
            {
                flowStatusCompleteTime: action.flowStatusCompleteTime,
                flowStatus: action.flowStatus,
                flowName: action.flowName
            }
        ]
    };

    if (isWorkflowCompleted(updatedActiveWorkflowDetails)) {
        const completedWorkflow = {
            ...updatedActiveWorkflowDetails,
            workflowStatus: workflowStatuses.completed
        };
        return loop({
            ...state,
            activeWorkflowsDetails: state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId),
            nonActiveWorkflowsDetails: [...state.nonActiveWorkflowsDetails, completedWorkflow]
        },
        Cmd.list(getActionsToTrigger(completedWorkflow)));
    }

    return loop({
        ...state,
        activeWorkflowsDetails: [
            ...state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId),
            updatedActiveWorkflowDetails
        ]
    },
    Cmd.list(getActionsToTrigger(updatedActiveWorkflowDetails)));
};