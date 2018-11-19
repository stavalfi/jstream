import {CHANGE_FLOW_STATUS} from './actions';
import {activeFlowStatus, flowStatus} from './statuses';
import thunk from 'redux-thunk';
import isPromise from 'is-promise';

const arrayMiddleware = store => next => action => {
    if (Array.isArray(action))
        return action.map(store.dispatch);
    return next(action);
};

const flowSelfResolvedMiddleware = store => next => action => {
    if (action.generalType === CHANGE_FLOW_STATUS &&
        action.hasOwnProperty('flowStatus') &&
        action.flowStatus === flowStatus.selfResolved &&
        !action.hasOwnProperty('flowFunctionResult')) {
        const {flowFunction} = action;
        const result = flowFunction(action.workflowId);
        if (isPromise(result))
            return result.then(value => ({
                type: action.type,
                generalType: CHANGE_FLOW_STATUS,
                flowName: action.flowName,
                workflowId: action.workflowId,
                flowStatus: action.flowStatus,
                time: action.time,
                activeFlowStatus: activeFlowStatus.succeed,
                flowFunctionResult: value
            }));

        return store.dispatch({
            type: action.type,
            generalType: CHANGE_FLOW_STATUS,
            flowName: action.flowName,
            workflowId: action.workflowId,
            flowStatus: action.flowStatus,
            time: action.time,
            activeFlowStatus: activeFlowStatus.succeed,
            flowFunctionResult: result
        });
    }
    return next(action);
};

export default [arrayMiddleware, flowSelfResolvedMiddleware, thunk];