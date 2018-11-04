import test from 'ava';
import {Cmd, loop} from 'redux-loop';
import createReducer from '../src/createReducer';
import readWorkflowsFile from '../src/workflowsJSONReader';
import createActions from '../src/createActions';
import flowStatuses from '../src/statuses/flowStatuses';
import workflowStatuses from '../src/statuses/workflowStatuses';
import Maybe from 'maybe';

/* eslint fp/no-nil:0 */

const assertLoopsEqual = t => (expectedLoop, actualLoop) => {
    t.deepEqual(actualLoop.state, expectedLoop.state);
};

test('test 1 - start a workflow', t => {
    const workflows = {
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    };
    const {flowsNames, workflowsDetails} = readWorkflowsFile(workflows);
    const actions = createActions(flowsNames);

    const flowsFunctions = {
        getUser: customParams => console.log('WOW!!!!', customParams, 'getUser')
    };

    const reducer = createReducer(actions, flowsFunctions, workflowsDetails);

    const state = {
        activeWorkflowsDetails: [],
        nonActiveWorkflowsDetails: []
    };
    const result = reducer(state, actions.getUser('id1', 'getUser', flowStatuses.started));

    assertLoopsEqual(t)(result, loop({
            activeWorkflowsDetails: [
                {
                    workflowId: 'id1',
                    workflowName: 'getUser',
                    head: Maybe({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        childs: []
                    }),
                    workflowStatus: workflowStatuses.started
                }
            ],
            nonActiveWorkflowsDetails: []
        },
        Cmd.list([
            Cmd.run(flowsFunctions.getUser, {
                successActionCreator: () => actions.getUser('id1', 'getUser', flowStatuses.selfResolved),
                failActionCreator: () => actions.getUser('id1', 'getUser', flowStatuses.selfResolved),
                args: ['id1']
            })
        ])
    ));
});

test('test 2 - self-resolve flow', t => {
    const workflows = {
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    };
    const {flowsNames, workflowsDetails} = readWorkflowsFile(workflows);
    const actions = createActions(flowsNames);

    const flowsFunctions = {
        getUser: customParams => console.log('WOW!!!!', customParams, 'getUser')
    };

    const reducer = createReducer(actions, flowsFunctions, workflowsDetails);

    const state = {
        activeWorkflowsDetails: [
            {
                workflowId: 'id1',
                workflowName: 'getUser',
                head: Maybe({
                    flowDetails: {
                        flowName: 'getUser',
                        flowStatus: flowStatuses.started
                    },
                    childs: []
                }),
                workflowStatus: workflowStatuses.started
            }
        ],
        nonActiveWorkflowsDetails: []
    };
    const result = reducer(state, actions.getUser('id1', 'getUser', flowStatuses.selfResolved));

    assertLoopsEqual(t)(result, loop({
            activeWorkflowsDetails: [
                {
                    workflowId: 'id1',
                    workflowName: 'getUser',
                    head: Maybe({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'getUser',
                                    flowStatus: flowStatuses.selfResolved
                                },
                                childs: []
                            }
                        ]
                    }),
                    workflowStatus: workflowStatuses.started
                }
            ],
            nonActiveWorkflowsDetails: []
        },
        Cmd.list([
            Cmd.action(actions.getUser('id1', 'getUser', flowStatuses.completed))
        ])
    ));
});

test('test 3 - complete workflow', t => {
    const workflows = {
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    };
    const {flowsNames, workflowsDetails} = readWorkflowsFile(workflows);
    const actions = createActions(flowsNames);

    const flowsFunctions = {
        getUser: customParams => console.log('WOW!!!!', customParams, 'getUser')
    };

    const reducer = createReducer(actions, flowsFunctions, workflowsDetails);

    const state = {
        activeWorkflowsDetails: [
            {
                workflowId: 'id1',
                workflowName: 'getUser',
                head: Maybe({
                    flowDetails: {
                        flowName: 'getUser',
                        flowStatus: flowStatuses.started
                    },
                    childs: [
                        {
                            flowDetails: {
                                flowName: 'getUser',
                                flowStatus: flowStatuses.selfResolved
                            },
                            childs: []
                        }
                    ]
                }),
                workflowStatus: workflowStatuses.started
            }
        ],
        nonActiveWorkflowsDetails: []
    };
    const result = reducer(state, actions.getUser('id1', 'getUser', flowStatuses.completed));

    assertLoopsEqual(t)(result, loop({
            activeWorkflowsDetails: [],
            nonActiveWorkflowsDetails: [
                {
                    workflowId: 'id1',
                    workflowName: 'getUser',
                    head: Maybe({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'getUser',
                                    flowStatus: flowStatuses.selfResolved
                                },
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'getUser',
                                            flowStatus: flowStatuses.completed
                                        },
                                        childs: []
                                    }
                                ]
                            }
                        ]
                    }),
                    workflowStatus: workflowStatuses.completed
                }
            ]
        },
        Cmd.none)
    );
});