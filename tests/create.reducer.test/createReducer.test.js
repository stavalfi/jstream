import test from 'ava';
import Optional from 'optional-js';
import {Cmd, loop} from 'redux-loop';
import createReducer from '../../src/reducer/createReducer';
import readWorkflowsFile from '../../src/json/parser';
import {
    startWorkflowAction as startWorkflowActionCreator,
    changeFlowStatusAction,
    completeWorkflowAction as completeWorkflowActionCreator
} from '../../src/actions';
import flowStatuses from '../../src/statuses/flowStatuses';
import workflowStatuses from '../../src/statuses/workflowStatuses';

/* eslint fp/no-nil:0 */

const assertLoopsEqual = t => (expectedLoop, actualLoop) => {
    t.deepEqual(actualLoop[0], expectedLoop[0]);
};

test('test 1 - start a workflow', t => {
    const {workflowsDetails} = readWorkflowsFile({
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    });
    const functions = {
        flows:{
            createUser: {
                getUser: customParams => console.log('Middle', customParams, 'getUser','____TEST____')
            },
        }
    };
    const getUserFlowName = 'getUser';
    const startWorkflowAction = startWorkflowActionCreator(getUserFlowName);

    const actualResult = createReducer(functions, workflowsDetails)({
        activeWorkflowsDetails: [],
        nonActiveWorkflowsDetails: []
    }, startWorkflowAction);

    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflowAction.workflowId,
                    workflowName: startWorkflowAction.workflowName,
                    workflowStatus: workflowStatuses.started,
                    head: Optional.of({
                        flowDetails: {
                            flowName: getUserFlowName,
                            flowStatus: flowStatuses.started
                        },
                        isCompleted: false,
                        childs: [
                            {
                                flowDetails: {
                                    flowName: getUserFlowName,
                                    flowStatus: flowStatuses.selfResolved
                                },
                                isCompleted: false,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: getUserFlowName,
                                            flowStatus: flowStatuses.completed
                                        },
                                        isCompleted: false,
                                        childs: []
                                    }
                                ]
                            }
                        ]
                    })
                }
            ],
            nonActiveWorkflowsDetails: []
        },
        Cmd.list([
            Cmd.action(changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.started))
        ])
    );
    assertLoopsEqual(t)(actualResult, expectedResult);
});

test('test 2 - start the flow', t => {
    const {workflowsDetails} = readWorkflowsFile({
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    });
    const functions = {
        flows:{
            getUser: {
                task: customParams => console.log('Middle', customParams, 'getUser','____TEST____')
            }
        }
    };
    const getUserFlowName = 'getUser';
    const startWorkflowAction = startWorkflowActionCreator(getUserFlowName);
    const startFlowAction = changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.started);

    const actualResult = createReducer(functions, workflowsDetails)({
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflowAction.workflowId,
                workflowName: startWorkflowAction.workflowName,
                workflowStatus: workflowStatuses.started,
                head: Optional.of({
                    flowDetails: {
                        flowName: getUserFlowName,
                        flowStatus: flowStatuses.started
                    },
                    isCompleted: false,
                    childs: [
                        {
                            flowDetails: {
                                flowName: getUserFlowName,
                                flowStatus: flowStatuses.selfResolved
                            },
                            isCompleted: false,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: getUserFlowName,
                                        flowStatus: flowStatuses.completed
                                    },
                                    isCompleted: false,
                                    childs: []
                                }
                            ]
                        }
                    ]
                })
            }
        ],
        nonActiveWorkflowsDetails: []
    }, startFlowAction);

    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflowAction.workflowId,
                    workflowName: startWorkflowAction.workflowName,
                    workflowStatus: workflowStatuses.started,
                    head: Optional.of({
                        flowDetails: {
                            flowName: getUserFlowName,
                            flowStatus: flowStatuses.started
                        },
                        isCompleted: true,
                        completeTime: startFlowAction.flowStatusCompleteTime,
                        childs: [
                            {
                                flowDetails: {
                                    flowName: getUserFlowName,
                                    flowStatus: flowStatuses.selfResolved
                                },
                                isCompleted: false,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: getUserFlowName,
                                            flowStatus: flowStatuses.completed
                                        },
                                        isCompleted: false,
                                        childs: []
                                    }
                                ]
                            }
                        ]
                    })
                }
            ],
            nonActiveWorkflowsDetails: []
        },
        Cmd.list([
            Cmd.run(functions.flows.getUser.task, {
                successActionCreator: () => changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.selfResolved),
                args: [startWorkflowAction.workflowId]
            })
        ])
    );
    assertLoopsEqual(t)(actualResult, expectedResult);
});

test('test 3 - self-resolve the flow', t => {
    const {workflowsDetails} = readWorkflowsFile({
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    });
    const functions = {
        flows:{
            getUser: {
                task: customParams => console.log('Middle', customParams, 'getUser','____TEST____')
            }
        }
    };
    const getUserFlowName = 'getUser';
    const startWorkflowAction = startWorkflowActionCreator(getUserFlowName);
    const startFlowAction = changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.started);
    const selfResolvedAction = changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.selfResolved);

    const actualResult = createReducer(functions, workflowsDetails)({
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflowAction.workflowId,
                workflowName: startWorkflowAction.workflowName,
                workflowStatus: workflowStatuses.started,
                head: Optional.of({
                    flowDetails: {
                        flowName: getUserFlowName,
                        flowStatus: flowStatuses.started
                    },
                    isCompleted: true,
                    completeTime: startFlowAction.flowStatusCompleteTime,
                    childs: [
                        {
                            flowDetails: {
                                flowName: getUserFlowName,
                                flowStatus: flowStatuses.selfResolved,
                            },
                            isCompleted: false,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: getUserFlowName,
                                        flowStatus: flowStatuses.completed
                                    },
                                    isCompleted: false,
                                    childs: []
                                }
                            ]
                        }
                    ]
                })
            }
        ],
        nonActiveWorkflowsDetails: []
    }, selfResolvedAction);

    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflowAction.workflowId,
                    workflowName: startWorkflowAction.workflowName,
                    workflowStatus: workflowStatuses.started,
                    head: Optional.of({
                        flowDetails: {
                            flowName: getUserFlowName,
                            flowStatus: flowStatuses.started
                        },
                        isCompleted: true,
                        completeTime: startFlowAction.flowStatusCompleteTime,
                        childs: [
                            {
                                flowDetails: {
                                    flowName: getUserFlowName,
                                    flowStatus: flowStatuses.selfResolved
                                },
                                isCompleted: true,
                                completeTime: selfResolvedAction.flowStatusCompleteTime,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: getUserFlowName,
                                            flowStatus: flowStatuses.completed
                                        },
                                        isCompleted: false,
                                        childs: []
                                    }
                                ]
                            }
                        ]
                    })
                }
            ],
            nonActiveWorkflowsDetails: []
        },
        Cmd.list([
            Cmd.action(changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.completed))
        ])
    );
    assertLoopsEqual(t)(actualResult, expectedResult);
});

test('test 4 - complete the flow', t => {
    const {workflowsDetails} = readWorkflowsFile({
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    });
    const functions = {
        flows:{
            getUser: {
                task: customParams => console.log('Middle', customParams, 'getUser','____TEST____')
            }
        }
    };
    const getUserFlowName = 'getUser';
    const startWorkflowAction = startWorkflowActionCreator(getUserFlowName);
    const startFlowAction = changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.started);
    const selfResolvedAction = changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.selfResolved);
    const completeAction = changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.completed);

    const state = {
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflowAction.workflowId,
                workflowName: startWorkflowAction.workflowName,
                workflowStatus: workflowStatuses.started,
                head: Optional.of({
                    flowDetails: {
                        flowName: getUserFlowName,
                        flowStatus: flowStatuses.started
                    },
                    isCompleted: true,
                    completeTime: startFlowAction.flowStatusCompleteTime,
                    childs: [
                        {
                            flowDetails: {
                                flowName: getUserFlowName,
                                flowStatus: flowStatuses.selfResolved,
                            },
                            isCompleted: true,
                            completeTime: selfResolvedAction.flowStatusCompleteTime,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: getUserFlowName,
                                        flowStatus: flowStatuses.completed
                                    },
                                    isCompleted: false,
                                    childs: []
                                }
                            ]
                        }
                    ]
                })
            }
        ],
        nonActiveWorkflowsDetails: []
    };
    const reducer = createReducer(functions, workflowsDetails);
    const actualResult = reducer(state, completeAction);

    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflowAction.workflowId,
                    workflowName: startWorkflowAction.workflowName,
                    workflowStatus: workflowStatuses.started,
                    head: Optional.of({
                        flowDetails: {
                            flowName: getUserFlowName,
                            flowStatus: flowStatuses.started
                        },
                        isCompleted: true,
                        completeTime: startFlowAction.flowStatusCompleteTime,
                        childs: [
                            {
                                flowDetails: {
                                    flowName: getUserFlowName,
                                    flowStatus: flowStatuses.selfResolved
                                },
                                isCompleted: true,
                                completeTime: selfResolvedAction.flowStatusCompleteTime,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: getUserFlowName,
                                            flowStatus: flowStatuses.completed
                                        },
                                        isCompleted: true,
                                        completeTime: completeAction.flowStatusCompleteTime,
                                        childs: []
                                    }
                                ]
                            }
                        ]
                    })
                }
            ],
            nonActiveWorkflowsDetails: []
        },
        Cmd.list([
            Cmd.action(completeWorkflowActionCreator(startWorkflowAction.workflowId))
        ])
    );
    assertLoopsEqual(t)(actualResult, expectedResult);
    const invalidActualResult = reducer(state, selfResolvedAction);
    t.notDeepEqual(invalidActualResult, expectedResult);
});

test('test 5 - complete workflow', t => {
    const {workflowsDetails} = readWorkflowsFile({
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    });
    const functions = {
        flows:{
            getUser: {
                task: customParams => console.log('Middle', customParams, 'getUser','____TEST____')
            }
        }
    };
    const getUserFlowName = 'getUser';
    const startWorkflowAction = startWorkflowActionCreator(getUserFlowName);
    const startFlowAction = changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.started);
    const selfResolvedAction = changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.selfResolved);
    const completeAction = changeFlowStatusAction(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.completed);
    const completeWorkflowAction = completeWorkflowActionCreator(startWorkflowAction.workflowId);

    const actualResult = createReducer(functions, workflowsDetails)({
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflowAction.workflowId,
                workflowName: startWorkflowAction.workflowName,
                workflowStatus: workflowStatuses.started,
                head: Optional.of({
                    flowDetails: {
                        flowName: getUserFlowName,
                        flowStatus: flowStatuses.started
                    },
                    isCompleted: true,
                    completeTime: startFlowAction.flowStatusCompleteTime,
                    childs: [
                        {
                            flowDetails: {
                                flowName: getUserFlowName,
                                flowStatus: flowStatuses.selfResolved
                            },
                            isCompleted: true,
                            completeTime: selfResolvedAction.flowStatusCompleteTime,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: getUserFlowName,
                                        flowStatus: flowStatuses.completed
                                    },
                                    isCompleted: true,
                                    completeTime: completeAction.flowStatusCompleteTime,
                                    childs: []
                                }
                            ]
                        }
                    ]
                })
            }
        ],
        nonActiveWorkflowsDetails: []
    }, completeWorkflowAction);

    const expectedResult = loop({
            activeWorkflowsDetails: [],
            nonActiveWorkflowsDetails: [
                {
                    workflowId: startWorkflowAction.workflowId,
                    workflowName: startWorkflowAction.workflowName,
                    workflowStatus: workflowStatuses.completed,
                    completeTime: completeWorkflowAction.completeWorkflowTime,
                    head: Optional.of({
                        flowDetails: {
                            flowName: getUserFlowName,
                            flowStatus: flowStatuses.started
                        },
                        isCompleted: true,
                        completeTime: startFlowAction.flowStatusCompleteTime,
                        childs: [
                            {
                                flowDetails: {
                                    flowName: getUserFlowName,
                                    flowStatus: flowStatuses.selfResolved
                                },
                                isCompleted: true,
                                completeTime: selfResolvedAction.flowStatusCompleteTime,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: getUserFlowName,
                                            flowStatus: flowStatuses.completed
                                        },
                                        isCompleted: true,
                                        completeTime: completeAction.flowStatusCompleteTime,
                                        childs: []
                                    }
                                ]
                            }
                        ]
                    })
                }
            ]
        },
        Cmd.none
    );
    assertLoopsEqual(t)(actualResult, expectedResult);
});