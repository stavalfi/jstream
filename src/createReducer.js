import {workflowStatus} from './statuses';
import {
    START_WORKFLOW,
    CHANGE_FLOW_STATUS,
    COMPLETE_WORKFLOW
} from './actions';
import {getFirstBy} from './utils';
import {
    initializeWorkflowGraph,
    updateCompletedNodeInGraph,
    findShouldStartNode,
    areAllFlowsCompleted
} from './reducerGraphOperations';
import Optional from 'optional-js';

const getWorkflowStatus = workflowDetails => workflowDetails.workflowStatusesHistory[workflowDetails.workflowStatusesHistory.length - 1].status;

const startWorkflow = (state, action, workflowsDetails) => {
    return getFirstBy(workflowsDetails, workflow => workflow.workflowName === action.workflowName)
        .filter(() => !state.activeWorkflowsDetails.some(workflowDetails => workflowDetails.workflowId === action.workflowId))
        .map(workflowDetails => ({
            workflowId: action.workflowId,
            workflowName: workflowDetails.workflowName,
            head: initializeWorkflowGraph(workflowDetails.head, action.time),
            workflowStatusesHistory: [
                {
                    status: workflowStatus.started,
                    time: action.time
                }
            ]
        }))
        .map(activeWorkflowDetails => ({
            ...state,
            activeWorkflowsDetails: [...state.activeWorkflowsDetails, activeWorkflowDetails],
        }))
        .orElse(state);
};

const changeFlowStatus = (state, action) => {
    return Optional.of(state.activeWorkflowsDetails.findIndex(workflowDetails => workflowDetails.workflowId === workflowDetails.workflowId))
        .flatMap(index => index > -1 ? Optional.of(index) : Optional.empty())
        .flatMap(activeWorkflowDetailsIndex => {
            const activeWorkflowDetails = state.activeWorkflowsDetails[activeWorkflowDetailsIndex];

            if (getWorkflowStatus(activeWorkflowDetails) !== workflowStatus.started)
                return Optional.of(state);

            return findShouldStartNode(activeWorkflowDetails.head, action.flowName, action.flowStatus)
                .map(nodeToSetAsCompleted => updateCompletedNodeInGraph(activeWorkflowDetails.head, nodeToSetAsCompleted, action.time))
                .map(({head}) => ({
                    ...activeWorkflowDetails,
                    head
                }))
                .map(updatedActiveWorkflowDetails => ({
                    ...state,
                    activeWorkflowsDetails: [
                        ...state.activeWorkflowsDetails.slice(0, activeWorkflowDetailsIndex),
                        updatedActiveWorkflowDetails,
                        ...state.activeWorkflowsDetails.slice(activeWorkflowDetailsIndex + 1)
                    ]
                }));
        })
        .orElse(state);
};

const completeWorkflow = (state, action) => {
    return getFirstBy(state.activeWorkflowsDetails, activeWorkflow => activeWorkflow.workflowId === action.workflowId)
        .filter(activeWorkflowDetails => getWorkflowStatus(activeWorkflowDetails) === workflowStatus.started)
        .filter(activeWorkflowDetails => areAllFlowsCompleted(activeWorkflowDetails.head))
        .map(activeWorkflowDetails => ({
            ...activeWorkflowDetails,
            workflowStatusesHistory: [
                ...activeWorkflowDetails.workflowStatusesHistory,
                {
                    status: workflowStatus.completed,
                    time: action.time
                }
            ]
        }))
        .map(updatedActiveWorkflowDetails => ({
            ...state,
            activeWorkflowsDetails: state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId !== updatedActiveWorkflowDetails.workflowId),
            nonActiveWorkflowsDetails: [...state.nonActiveWorkflowsDetails, updatedActiveWorkflowDetails]
        }))
        .orElse(state);
};

const initialState = {
    activeWorkflowsDetails: [],
    nonActiveWorkflowsDetails: []
};

export default workflowsDetails => (state = initialState, action) => {
    switch (action.generalType) {
        case START_WORKFLOW:
            return startWorkflow(state, action, workflowsDetails);
        case CHANGE_FLOW_STATUS:
            return changeFlowStatus(state, action);
        case COMPLETE_WORKFLOW:
            return completeWorkflow(state, action);
    }
    return state;
};