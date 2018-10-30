import {createStore, compose, applyMiddleware} from 'redux';
import flowsJson from "../workflows"

// TODO: validate flowsJson.json before using it.

const workflowsDetails = flowsJson.workflowsDetails.map(flow => {
    // if (flow === null)
    //     throw Error("there is a null inside flowsJson.json.");
    if (typeof flow === 'string' || flow instanceof String)
        return {
            workflowName: flow,
            workflow: [flow]
        };
    if (flow !== null && typeof flow === 'object')
        if (flow.length === 0)
            throw Error("empty workflow in flowsJson.json.");
        else
            return {
                workflowName: flow.workflowName,
                workflow: [flow.workflow]
            };
    throw Error("illegal workflow: " + flow);
});

const init = (flowsNames, workflowsDetails) => ({
    type: "INITIALIZE_WORKFLOWS",
    flowsNames,
    workflowsDetails
});

const actions = flowsJson.flowsNames.reduce((flowsObjUntilNow, flowName) => ({
    ...flowsObjUntilNow,
    [flowName]: (workflowId, workflowName, flowStatus) => ({
        type: "COMPLETED_STATUS",
        flowName,
        workflowId,
        workflowName,
        flowStatus,
        flowStatusCompleteTime: new Date()
    })
}), {});


const isActionValid = (state, action) => {
    if (action.type !== "COMPLETED_STATUS")
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

const isStatusLegalInThisWorkflow = (activeWorkflowDetails, flow, status) => false;

const isWorkflowCompleted = activeWorkflowDetails => false;

const flowStatuses = {
    started: 1,
    selfResolved: 2,
    completed: 3,
    // canceled: 4,
};
const workflowStatuses = {
    started: 1,
    completed: 2,
    // canceled: 3,
};

let initialState = {
    flowsNames: flowsJson.flowsNames,
    workflowsDetails,
    activeWorkflowsDetails: [],
    nonActiveWorkflowsDetails: []
};
const reducer = (state = initialState, action) => {
    if (!isActionValid(state, action))
        return state;

    const workflowDetails = state.workflowsDetails.filter(workflow => workflow.workflowName === action.workflowName);

    if (workflowDetails.length === 0)
    // the workflow does not exist by the given name in the action.
        return state;

    const activeWorkflowDetails = state.activeWorkflowsDetails.filter(activeWorkflow => activeWorkflow.workflowId === action.workflowId)

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
        return {
            ...state,
            activeWorkflowsDetails: [...state.activeWorkflowsDetails, newActiveWorkflow],
        };
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

    if (isWorkflowCompleted(updatedActiveWorkflowDetails))
        return {
            ...state,
            activeWorkflowsDetails: state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId),
            nonActiveWorkflowsDetails: [
                ...state.nonActiveWorkflowsDetails,
                {
                    ...updatedActiveWorkflowDetails,
                    workflowStatus: workflowStatuses.completed
                }
            ]
        };

    return {
        ...state,
        activeWorkflowsDetails: [
            ...state.activeWorkflowsDetails.filter(activeWorkflowDetails => activeWorkflowDetails.workflowId),
            updatedActiveWorkflowDetails
        ]
    };
};

const logger = store => next => action => {
    console.group(action.type);
    console.info('dispatching', action);
    let result = next(action);
    console.log('next state', store.getState());
    console.groupEnd();
    return result
};

const enhancer = compose(
    applyMiddleware(logger)
);

const store = createStore(reducer, enhancer);

store.dispatch(actions.a("1", "a", flowStatuses.started));


// const initialState____example = {
//     activeWorkflowsDetails: [
//         {
//             workflowId: "2873ye3787e32",
//             workflow: "ref to the actual workflow",
//             workflowStatuses: [
//                 // done statuses only.
//                 {
//                     flowName: "a",
//                     flowStatus: "1 or 2 or 3",
//                     flowStatusCompleteTime: "time in milliseconds"
//                 }
//             ]
//         }
//     ],
//     nonActiveWorkflowsDetails: [
//         {}
//     ]
// };