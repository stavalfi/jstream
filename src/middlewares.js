import {CHANGE_FLOW_STATUS} from './actions';
import {nodeStatus, flowStatus} from './statuses';
import createUserGraphOperations from './createUserGraphOperations';
import thunk from 'redux-thunk';

const arrayMiddleware = store => next => action => {
    if (Array.isArray(action))
        return action.map(store.dispatch);
    return next(action);
};

const createFlowSelfResolvedMiddleware = stateSelector => store => next => action => {
    if (action.generalType === CHANGE_FLOW_STATUS &&
        action.hasOwnProperty('flowStatus') &&
        action.flowStatus === flowStatus.selfResolved &&
        !action.hasOwnProperty('flowFunctionResult')) {
        const {flowFunction} = action;

        const userCustomParamsObject = stateSelector(store.getState())
            .activeWorkflowsDetails.find(workflowsDetails => workflowsDetails.workflowId === action.workflowId)
            .userCustomParamsObject;

        const result = flowFunction(action.workflowId, createUserGraphOperations(store.getState(), action.workflowId), userCustomParamsObject);

        return store.dispatch({
            type: action.type,
            generalType: CHANGE_FLOW_STATUS,
            flowName: action.flowName,
            workflowId: action.workflowId,
            flowStatus: action.flowStatus,
            time: action.time,
            activeFlowStatus: nodeStatus.succeed,
            flowFunctionResult: result
        });
    }
    return next(action);
};

export {thunk, arrayMiddleware, createFlowSelfResolvedMiddleware};