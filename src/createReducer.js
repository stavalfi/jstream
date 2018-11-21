import {activeFlowStatus, workflowStatus} from './statuses';
import {START_WORKFLOW, CHANGE_FLOW_STATUS, COMPLETE_WORKFLOW} from './actions';
import {updateNodeAsSucceedInGraph, getNodeActiveStatus} from './reducerGraphOperations';

const getWorkflowStatus = workflowDetails => workflowDetails.workflowStatusesHistory[workflowDetails.workflowStatusesHistory.length - 1].status;

const startWorkflow = (state, action, workflowsDetails) => {
    const workflowDetailsIndex = workflowsDetails.findIndex(workflow => workflow.workflowName === action.workflowName);

    if (workflowDetailsIndex === -1 ||
        state.activeWorkflowsDetails.findIndex(workflowDetails => workflowDetails.workflowId === workflowDetails.workflowId) > -1)
        return state;

    return {
        ...state,
        activeWorkflowsDetails: [
            ...state.activeWorkflowsDetails,
            {
                workflowId: action.workflowId,
                workflowName: workflowsDetails[workflowDetailsIndex].workflowName,
                userCustomParamsObject: action.userCustomParamsObject,
                graph: workflowsDetails[workflowDetailsIndex].graph.map((node, i) => i === 0 ?
                    {
                        ...node,
                        nodeStatusesHistory: [
                            {
                                status: activeFlowStatus.notStarted,
                                time: action.time
                            },
                            {
                                status: activeFlowStatus.shouldStart,
                                time: action.time
                            }
                        ]
                    } :
                    {
                        ...node,
                        nodeStatusesHistory: [
                            {
                                status: activeFlowStatus.notStarted,
                                time: action.time
                            }
                        ]
                    }),
                workflowStatusesHistory: [
                    {
                        status: workflowStatus.started,
                        time: action.time
                    }
                ]
            }
        ],
    };
};

const changeFlowStatus = (state, action) => {
    const activeWorkflowDetailsIndex = state.activeWorkflowsDetails.findIndex(workflowDetails => workflowDetails.workflowId === workflowDetails.workflowId);
    if (activeWorkflowDetailsIndex === -1 ||
        getWorkflowStatus(state.activeWorkflowsDetails[activeWorkflowDetailsIndex]) !== workflowStatus.started)
        return state;

    const activeWorkflowDetails = state.activeWorkflowsDetails[activeWorkflowDetailsIndex];

    // the node that the action is referring to.
    const nodeIndexToSetAsSucceed = activeWorkflowDetails.graph.map((node, i) => i)
        .find(i => getNodeActiveStatus(activeWorkflowDetails.graph[i]) === activeFlowStatus.shouldStart &&
            activeWorkflowDetails.graph[i].flowDetails.flowName === action.flowName &&
            activeWorkflowDetails.graph[i].flowDetails.flowStatus === action.flowStatus);

    return {
        ...state,
        activeWorkflowsDetails: [
            ...state.activeWorkflowsDetails.slice(0, activeWorkflowDetailsIndex),
            {
                ...activeWorkflowDetails,
                graph: updateNodeAsSucceedInGraph(activeWorkflowDetails.graph, nodeIndexToSetAsSucceed, action.time)
            },
            ...state.activeWorkflowsDetails.slice(activeWorkflowDetailsIndex + 1)
        ]
    };
};

const completeWorkflow = (state, action) => {
    const activeWorkflowDetailsIndex = state.activeWorkflowsDetails.findIndex(workflowDetails => workflowDetails.workflowId === workflowDetails.workflowId);
    if (activeWorkflowDetailsIndex === -1 ||
        getWorkflowStatus(state.activeWorkflowsDetails[activeWorkflowDetailsIndex]) !== workflowStatus.started ||
        state.activeWorkflowsDetails[activeWorkflowDetailsIndex].graph.some(node => getNodeActiveStatus(node) !== activeFlowStatus.succeed))
        return state;

    return {
        ...state,
        activeWorkflowsDetails: state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId !== action.workflowId),
        nonActiveWorkflowsDetails: [
            ...state.nonActiveWorkflowsDetails,
            {
                ...state.activeWorkflowsDetails[activeWorkflowDetailsIndex],
                workflowStatusesHistory: [
                    ...state.activeWorkflowsDetails[activeWorkflowDetailsIndex].workflowStatusesHistory,
                    {
                        status: workflowStatus.completed,
                        time: action.time
                    }
                ]
            }
        ]
    };
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