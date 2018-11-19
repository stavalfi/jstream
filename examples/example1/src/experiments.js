import {applyMiddleware, createStore, combineReducers} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension'

const rootReducer = (state = 0, action) => {
    switch (action.generalType) {
        case "increase":
            return state + 1;
        case "decrease":
            return state - 1;
    }
    return state;
};

const loggerMiddleware = store => next => action => {
    console.log('logger');
    console.group(action.generalType);
    console.info('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());
    console.groupEnd();
    return result;
};

// middlewareEnhancer === createStore => (reducer, preloadedState) => action => process the action and sent it to
//                                                                              the original reducer or to the
//                                                                              next middleware.
// how it works: applyMiddleware calls createStore with (reducer, preloadedState) and return a function that accepts action.
const middlewareEnhancer = applyMiddleware(thunkMiddleware, loggerMiddleware);

// monitorReducerEnhancer === createStore => createStore' (createStore' accepts enhancer at the last parameter).
// note1: (the only difference is the new reducer calls the original reducer).
const monitorReducerEnhancer = createStore => (reducer, initialState, enhancer) => {
    const monitoredReducer = (state, action) => {
        const start = 1;
        const newState = reducer(state, action);
        const end = 2;
        const diff = Math.round((end - start) * 100) / 100;

        console.log('reducer process time:', diff);

        return newState;
    };

    return createStore(monitoredReducer, initialState, enhancer);
};


// composedEnhancers === createStore => (reducer, preloadedState) => action => process the action and sent it to
//                                                                             the original reducer or to the
//                                                                             next middleware.
const composedEnhancers = composeWithDevTools(
    middlewareEnhancer,
    monitorReducerEnhancer,
    monitorReducerEnhancer
);

const store = createStore(combineReducers({rootReducer}), undefined, composedEnhancers);

function fetches() {
    return dispatch => {
        console.log('invoking async action creator');
        dispatch({
            generalType: 'increase'
        });
        dispatch({
            generalType: 'increase'
        });
    }
}

store.dispatch(fetches());

// redux-pack example:

import {handle} from 'redux-pack';

const LOAD_FOO = 'LOAD_FOO';
const initialState = {
    isLoading: false,
    error: null,
    foo: null,
};

export function rootReducer1(state = initialState, action) {
    const {type, payload} = action;
    switch (type) {
        case LOAD_FOO:
            return handle(state, action, {
                start: prevState => ({...prevState, isLoading: true, error: null, foo: null}),
                finish: prevState => ({...prevState, isLoading: false}),
                failure: prevState => ({...prevState, error: payload}),
                success: prevState => ({...prevState, foo: payload}),
                always: prevState => prevState, // unnecessary, for the sake of example
            });
        default:
            return state;
    }
}

export function loadFoo() {
    return {
        generalType: LOAD_FOO,
        promise: Promise.reject('hi!'),
    }
}

import {middleware as reduxPackMiddleware} from 'redux-pack';
import {createLogger} from 'redux-logger';

const logger = createLogger();
const store1 = createStore(
    rootReducer1,
    applyMiddleware(thunkMiddleware, reduxPackMiddleware, logger)
);

store1.dispatch(loadFoo());