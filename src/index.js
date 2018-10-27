// import "./part2/index";
// import "./styles.css";

import {createAction, createReducer} from 'redux-act';
import {createStore, compose, applyMiddleware} from 'redux';
import {install, loop, Cmd} from 'redux-loop';
import flowsJson from "../flows"

// TODO: validate flowsJson.json before using it.

const flows = flowsJson.flows.map(flow => {
    if (flow !== null)
        throw Error("there is a null inside flowsJson.json.");
    if (typeof flow === 'string' || flow instanceof String)
        return {
            [flow]: [flow]
        };
    if (flow !== null && typeof flow === 'object')
        if (flow.length === 0)
            throw Error("empty flow in flowsJson.json.");
        else
            return {
                [flow.flowName]: flow.flow
            };
    throw Error("illegal flow: " + flow);
}).reduce((flows, flow) => ({...flows, [Object.keys(flow)[0]]: flow}), {});

const actions = flowsJson.actions.reduce((obj, actionType) => ({
    ...obj,
    [actionType]: (flowId,status) => ({
        flowId,
        type: actionType,
        status
    })
}), {});

const initialState = {
    activeFlows: [
        {
            flowName: "add",
            flowId:"12d3df"
        }
    ]
};

const reducer = (state = initialState, action) => {
    if (!actions.hasOwnProperty(action.type))
        return state;

    const flow = flows[action.type];



        if (action.type)
            switch (action.type) {
                case 'INIT':
                    return loop(
                        {...state, initStarted: true},
                        Cmd.run(fetchUser, {
                            successActionCreator: userFetchSuccessfulAction,
                            failActionCreator: userFetchFailedAction,
                            args: ['1234']
                        })
                    );

                case 'USER_FETCH_SUCCESSFUL':
                    return {...state, user: action.user};

                case 'USER_FETCH_FAILED':
                    return {...state, error: action.error};

                default:
                    return state;
            }
};

/**
 * In your reducer you can choose to return a loop or not. The typical pattern
 * you'll end up using is to have some sort of `__Start` action that feeds into
 * one or more pairs of `__Succeed` and `__Fail` actions. You must always handle
 * the failure case, even if the handler is a no-op!
 */
const reducer = createReducer({

    /**
     * The following three reducers start through the process of updating the
     * counter on the short timer. The process starts here and can either fail
     * or succeed randomly, and we've covered both cases.
     */
    [Actions.shortIncrementStart]: (state, amount) => {
        console.log('short start');
        return loop(state
                .setIn(['short', 'loading'], true)
                .setIn(['short', 'failed'], false),
            Cmd.run(Api.shortIncrement, {
                successActionCreator: Actions.shortIncrementSucceed,
                failActionCreator: Actions.shortIncrementFail,
                args: [amount]
            })
        )
    },

    [Actions.shortIncrementSucceed]: (state, amount) => {
        console.log('short success');
        return state
            .setIn(['short', 'loading'], false)
            .updateIn(['short', 'count'], (current) => current + amount)
    },

    [Actions.shortIncrementFail]: (state) => {
        console.log('short fail');
        return state
            .setIn(['short', 'loading'], false)
            .setIn(['short', 'failed'], true)
    },

    /**
     * The following three reducers perform the same such behavior for the counter
     * on the long timer.
     */
    [Actions.longIncrementStart]: (state, amount) => {
        console.log('long start');
        return loop(state
                .setIn(['long', 'loading'], true)
                .setIn(['long', 'failed'], false),
            Cmd.run(Api.longIncrement, {
                successActionCreator: Actions.longIncrementSucceed,
                failActionCreator: Actions.longIncrementFail,
                args: [amount]
            }))
    },

    [Actions.longIncrementSucceed]: (state, amount) => {
        console.log('long success');
        return state
            .setIn(['long', 'loading'], false)
            .updateIn(['long', 'count'], (current) => current + amount)
    },

    [Actions.longIncrementFail]: (state) => {
        console.log('log failed');
        return state
            .setIn(['long', 'loading'], false)
            .setIn(['long', 'failed'], true)
    },

    /**
     * This final action groups the two increment start actions with a list.
     */
    [Actions.incrementBothStart]: (state, amount) => {
        console.log('both start');
        return loop(state,
            Cmd.list([
                Cmd.action(Actions.shortIncrementStart(amount)),
                Cmd.action(Actions.longIncrementStart(amount)),
            ])
        )
    },
}, initialState);


function fetchUser(userId) {
    return new Promise((res, rej) => setTimeout(() => rej(userId), 1000));
}


function initAction() {
    return {
        type: 'INIT'
    };
}

function userFetchSuccessfulAction(user) {
    return {
        type: 'USER_FETCH_SUCCESSFUL',
        user
    };
}

function userFetchFailedAction(err) {
    return {
        type: 'USER_FETCH_ERROR',
        err
    };
}

const initialState = {
    initStarted: false,
    user: null,
    error: null
};

function reducer(state = initialState, action) {
    console.log(2, "reducer received new action", action);
    switch (action.type) {
        case 'INIT':
            return loop(
                {...state, initStarted: true},
                Cmd.run(fetchUser, {
                    successActionCreator: userFetchSuccessfulAction,
                    failActionCreator: userFetchFailedAction,
                    args: ['1234']
                })
            );

        case 'USER_FETCH_SUCCESSFUL':
            return {...state, user: action.user};

        case 'USER_FETCH_FAILED':
            return {...state, error: action.error};

        default:
            return state;
    }
}

const logger = store => next => action => {
    console.log(1);
    console.group(action.type);
    console.info('dispatching', action);
    let result = next(action);
    console.log('next state', store.getState());
    console.groupEnd();
    return result
};

const enhancer = compose(
    install(),
    applyMiddleware(logger)
);

const store = createStore(reducer, initialState, enhancer);

store.dispatch(initAction());