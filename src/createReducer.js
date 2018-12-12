import {nodeStatus} from './statuses';
import {START_WORKFLOW, CHANGE_FLOW_STATUS, COMPLETE_WORKFLOW} from './actions';
import {updateNodeAsSucceedInGraph, getNodeActiveStatus} from './reducerGraphOperations';

const startWorkflow = (state, action, workflowsDetails) => {
    const workflowDetails = workflowsDetails.find(workflow => workflow.workflowName === action.workflowName);

    return (workflowDetails && state.activeWorkflowsDetails.every(workflowDetails => workflowDetails.workflowId !== workflowDetails.workflowId))
        ? {
            ...state,
            activeWorkflowsDetails: [
                ...state.activeWorkflowsDetails,
                {
                    workflowId: action.workflowId,
                    workflowName: workflowDetails.workflowName,
                    userCustomParamsObject: action.userCustomParamsObject,
                    graph: workflowDetails.graph.map((node, i) => i === 0 ?
                        {
                            ...node,
                            nodeStatusesHistory: [
                                {
                                    status: nodeStatus.notStarted,
                                    time: action.time
                                },
                                {
                                    status: nodeStatus.shouldStart,
                                    time: action.time
                                }
                            ]
                        } :
                        {
                            ...node,
                            nodeStatusesHistory: [
                                {
                                    status: nodeStatus.notStarted,
                                    time: action.time
                                }
                            ]
                        })
                }
            ],
        }
        : state;
};

const changeFlowStatus = (state, action) => {
    const activeWorkflowDetailsIndex = state.activeWorkflowsDetails.findIndex(workflowDetails => workflowDetails.workflowId === workflowDetails.workflowId);

    const activeWorkflowDetails = activeWorkflowDetailsIndex && state.activeWorkflowsDetails[activeWorkflowDetailsIndex];

    // the node that the action is referring to.
    const nodeIndexToSetAsSucceed = activeWorkflowDetails && activeWorkflowDetails.graph.map((node, i) => i)
        .find(i => getNodeActiveStatus(activeWorkflowDetails.graph[i]) === nodeStatus.shouldStart &&
            activeWorkflowDetails.graph[i].flowDetails.flowName === action.flowName &&
            activeWorkflowDetails.graph[i].flowDetails.flowStatus === action.flowStatus);

    return nodeIndexToSetAsSucceed
        ? {
            ...state,
            activeWorkflowsDetails: [
                ...state.activeWorkflowsDetails.slice(0, activeWorkflowDetailsIndex),
                {
                    ...activeWorkflowDetails,
                    graph: updateNodeAsSucceedInGraph(activeWorkflowDetails.graph, nodeIndexToSetAsSucceed, action)
                },
                ...state.activeWorkflowsDetails.slice(activeWorkflowDetailsIndex + 1)
            ]
        }
        : state;
};

const completeWorkflow = (state, action) => {
    const activeWorkflowDetails = state.activeWorkflowsDetails.find(workflowDetails => workflowDetails.workflowId === workflowDetails.workflowId);

    return (activeWorkflowDetails && activeWorkflowDetails.graph.some(node => getNodeActiveStatus(node) !== nodeStatus.succeed))
        ? {
            ...state,
            activeWorkflowsDetails: state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId !== action.workflowId),
            nonActiveWorkflowsDetails: [...state.nonActiveWorkflowsDetails, activeWorkflowDetails]
        }
        : state;
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