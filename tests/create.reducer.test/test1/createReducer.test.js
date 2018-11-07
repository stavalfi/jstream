import test from 'ava';
import {Cmd, loop} from 'redux-loop';
import createReducer from '../../../src/createReducer';
import readWorkflowsFile from '../../../src/workflowsJSONReader';
import {
    startWorkflowAction,
    changeFlowStatusAction,
    completeWorkflowAction
} from '../../../src/actions';
import flowStatuses from '../../../src/statuses/flowStatuses';
import workflowStatuses from '../../../src/statuses/workflowStatuses';
import Optional from 'optional-js';
import workflowsJson from './workflows.json';
import functions from './workflows.js';

/* eslint fp/no-nil:0 */

const assertLoopsEqual = t => (expectedLoop, actualLoop) => {
    t.deepEqual(actualLoop[0], expectedLoop[0]);
};

const {workflowsDetails} = readWorkflowsFile(workflowsJson);
const startWorkflow1Action = startWorkflowAction('workflow1');
const startGetUserAction = changeFlowStatusAction(startWorkflow1Action.workflowId, 'getUser', flowStatuses.started);
const startCreateUserAction = changeFlowStatusAction(startWorkflow1Action.workflowId, 'createUser', flowStatuses.started);
const startUpdateServerAction = changeFlowStatusAction(startWorkflow1Action.workflowId, 'updateServer', flowStatuses.started);
const selfResolvedCreateUserAction = changeFlowStatusAction(startWorkflow1Action.workflowId, 'createUser', flowStatuses.selfResolved);
const selfResolvedUpdateServerAction = changeFlowStatusAction(startWorkflow1Action.workflowId, 'updateServer', flowStatuses.selfResolved);
const completeCreateUserAction = changeFlowStatusAction(startWorkflow1Action.workflowId, 'createUser', flowStatuses.completed);
const completeUpdateServerAction = changeFlowStatusAction(startWorkflow1Action.workflowId, 'updateServer', flowStatuses.completed);
const selfResolvedGetUserAction = changeFlowStatusAction(startWorkflow1Action.workflowId, 'getUser', flowStatuses.selfResolved);
const completeGetUserAction = changeFlowStatusAction(startWorkflow1Action.workflowId, 'getUser', flowStatuses.completed);
const completeWorkflow1Action = completeWorkflowAction(startWorkflow1Action.workflowId);

test('test 1 - start the workflow', t => {
    const action = startWorkflow1Action;
    const selfResolvedGetUserNode = {
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
    };
    const state = {
        activeWorkflowsDetails: [],
        nonActiveWorkflowsDetails: []
    };

    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflow1Action.workflowId,
                    workflowName: startWorkflow1Action.workflowName,
                    workflowStatus: workflowStatuses.started,
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                childs: [selfResolvedGetUserNode]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                flowDetails: {
                                    flowName: 'updateServer',
                                    flowStatus: flowStatuses.started
                                },
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                childs: [selfResolvedGetUserNode]
                                            }
                                        ]
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
            Cmd.run(functions.startWorkflowsFunctions.workflow1, {
                successActionCreator: () => startGetUserAction,
                args: [startWorkflow1Action.workflowId]
            })
        ])
    );
    const actualResult = createReducer(functions, workflowsDetails)(state, action);
    assertLoopsEqual(t)(actualResult, expectedResult);
});

test('test 2 - start the workflow - no start workflow function', t => {
    const action = startWorkflow1Action;
    const selfResolvedGetUserNode = {
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
    };
    const state = {
        activeWorkflowsDetails: [],
        nonActiveWorkflowsDetails: []
    };

    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflow1Action.workflowId,
                    workflowName: startWorkflow1Action.workflowName,
                    workflowStatus: workflowStatuses.started,
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                childs: [selfResolvedGetUserNode]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                flowDetails: {
                                    flowName: 'updateServer',
                                    flowStatus: flowStatuses.started
                                },
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                childs: [selfResolvedGetUserNode]
                                            }
                                        ]
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
            Cmd.action(startGetUserAction)
        ])
    );
    const actualResult = createReducer({
        startWorkflowsFunctions: {},
        flowsFunctions: {
            createUser: customParams => console.log('Middle', customParams, 'createUser'),
            removeUser: customParams => console.log('Middle', customParams, 'removeUser'),
            updateServer: customParams => console.log('Middle', customParams, 'updateServer'),
            getUser: customParams => console.log('Middle', customParams, 'getUser')
        },
        completeWorkflowsFunctions: {
            workflow1: customParams => console.log('Completed Flow', customParams, 'workflow1'),
        },
    }, workflowsDetails)(state, action);
    assertLoopsEqual(t)(actualResult, expectedResult);
});

test('test 3 - dispatch complete of one flow from multiple parallel flows.', t => {
    const action = completeCreateUserAction;
    const selfResolvedGetUserNode = {
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
    };
    const state = {
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflow1Action.workflowId,
                workflowName: startWorkflow1Action.workflowName,
                workflowStatus: workflowStatuses.started,
                head: Optional.of({
                    flowDetails: {
                        flowName: 'getUser',
                        flowStatus: flowStatuses.started
                    },
                    isCompleted: true,
                    completeTime: startGetUserAction.flowStatusCompleteTime,
                    childs: [
                        {
                            flowDetails: {
                                flowName: 'createUser',
                                flowStatus: flowStatuses.started
                            },
                            isCompleted: true,
                            completeTime: startCreateUserAction.flowStatusCompleteTime,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'createUser',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    isCompleted: true,
                                    completeTime: selfResolvedCreateUserAction.flowStatusCompleteTime,
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'createUser',
                                                flowStatus: flowStatuses.completed
                                            },
                                            childs: [selfResolvedGetUserNode]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            flowDetails: {
                                flowName: 'updateServer',
                                flowStatus: flowStatuses.started
                            },
                            isCompleted: true,
                            completeTime: startUpdateServerAction.flowStatusCompleteTime,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'updateServer',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    isCompleted: true,
                                    completeTime: selfResolvedUpdateServerAction.flowStatusCompleteTime,
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'updateServer',
                                                flowStatus: flowStatuses.completed
                                            },
                                            childs: [selfResolvedGetUserNode]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                })
            }
        ],
        nonActiveWorkflowsDetails: []
    };

    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflow1Action.workflowId,
                    workflowName: startWorkflow1Action.workflowName,
                    workflowStatus: workflowStatuses.started,
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        isCompleted: true,
                        completeTime: startGetUserAction.flowStatusCompleteTime,
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                isCompleted: true,
                                completeTime: startCreateUserAction.flowStatusCompleteTime,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        isCompleted: true,
                                        completeTime: selfResolvedCreateUserAction.flowStatusCompleteTime,
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                isCompleted: true,
                                                completeTime: completeCreateUserAction.flowStatusCompleteTime,
                                                childs: [selfResolvedGetUserNode]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                flowDetails: {
                                    flowName: 'updateServer',
                                    flowStatus: flowStatuses.started
                                },
                                isCompleted: true,
                                completeTime: startUpdateServerAction.flowStatusCompleteTime,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        isCompleted: true,
                                        completeTime: selfResolvedUpdateServerAction.flowStatusCompleteTime,
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                childs: [selfResolvedGetUserNode]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    })
                }
            ],
            nonActiveWorkflowsDetails: []
        },
        Cmd.list([])
    );
    const actualResult = createReducer(functions, workflowsDetails)(state, action);
    // assertLoopsEqual(t)(actualResult, expectedResult);
    t.deepEqual(actualResult, expectedResult);
});

test('test 4 - dispatch complete of the last flow from multiple parallel flows.', t => {
    const action = completeUpdateServerAction;
    const selfResolvedGetUserNode = {
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
    };
    const state = {
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflow1Action.workflowId,
                workflowName: startWorkflow1Action.workflowName,
                workflowStatus: workflowStatuses.started,
                head: Optional.of({
                    flowDetails: {
                        flowName: 'getUser',
                        flowStatus: flowStatuses.started
                    },
                    isCompleted: true,
                    completeTime: startGetUserAction.flowStatusCompleteTime,
                    childs: [
                        {
                            flowDetails: {
                                flowName: 'createUser',
                                flowStatus: flowStatuses.started
                            },
                            isCompleted: true,
                            completeTime: startCreateUserAction.flowStatusCompleteTime,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'createUser',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    isCompleted: true,
                                    completeTime: selfResolvedCreateUserAction.flowStatusCompleteTime,
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'createUser',
                                                flowStatus: flowStatuses.completed
                                            },
                                            isCompleted: true,
                                            completeTime: completeCreateUserAction.flowStatusCompleteTime,
                                            childs: [selfResolvedGetUserNode]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            flowDetails: {
                                flowName: 'updateServer',
                                flowStatus: flowStatuses.started
                            },
                            isCompleted: true,
                            completeTime: startUpdateServerAction.flowStatusCompleteTime,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'updateServer',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    isCompleted: true,
                                    completeTime: selfResolvedUpdateServerAction.flowStatusCompleteTime,
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'updateServer',
                                                flowStatus: flowStatuses.completed
                                            },
                                            childs: [selfResolvedGetUserNode]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                })
            }
        ],
        nonActiveWorkflowsDetails: []
    };

    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflow1Action.workflowId,
                    workflowName: startWorkflow1Action.workflowName,
                    workflowStatus: workflowStatuses.started,
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        isCompleted: true,
                        completeTime: startGetUserAction.flowStatusCompleteTime,
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                isCompleted: true,
                                completeTime: startCreateUserAction.flowStatusCompleteTime,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        isCompleted: true,
                                        completeTime: selfResolvedCreateUserAction.flowStatusCompleteTime,
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                isCompleted: true,
                                                completeTime: completeCreateUserAction.flowStatusCompleteTime,
                                                childs: [selfResolvedGetUserNode]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                flowDetails: {
                                    flowName: 'updateServer',
                                    flowStatus: flowStatuses.started
                                },
                                isCompleted: true,
                                completeTime: startUpdateServerAction.flowStatusCompleteTime,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        isCompleted: true,
                                        completeTime: selfResolvedUpdateServerAction.flowStatusCompleteTime,
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                isCompleted: true,
                                                completeTime: completeUpdateServerAction.flowStatusCompleteTime,
                                                childs: [selfResolvedGetUserNode]
                                            }
                                        ]
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
            Cmd.run(functions.flowsFunctions.getUser, {
                successActionCreator: () => selfResolvedGetUserAction,
                args: [startWorkflowAction.workflowId]
            })
        ])
    );
    const actualResult = createReducer(functions, workflowsDetails)(state, action);
    assertLoopsEqual(t)(actualResult, expectedResult);
});

test('test 5 - dispatch the last flow action in the workflow', t => {
    const action = completeGetUserAction;
    const selfResolvedGetUserNode = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: flowStatuses.selfResolved
        },
        isCompleted: true,
        completeTime: selfResolvedGetUserAction.flowStatusCompleteTime,
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                childs: []
            }
        ]
    };
    const state = {
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflow1Action.workflowId,
                workflowName: startWorkflow1Action.workflowName,
                workflowStatus: workflowStatuses.started,
                head: Optional.of({
                    flowDetails: {
                        flowName: 'getUser',
                        flowStatus: flowStatuses.started
                    },
                    isCompleted: true,
                    completeTime: startGetUserAction.flowStatusCompleteTime,
                    childs: [
                        {
                            flowDetails: {
                                flowName: 'createUser',
                                flowStatus: flowStatuses.started
                            },
                            isCompleted: true,
                            completeTime: startCreateUserAction.flowStatusCompleteTime,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'createUser',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    isCompleted: true,
                                    completeTime: selfResolvedCreateUserAction.flowStatusCompleteTime,
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'createUser',
                                                flowStatus: flowStatuses.completed
                                            },
                                            isCompleted: true,
                                            completeTime: completeCreateUserAction.flowStatusCompleteTime,
                                            childs: [selfResolvedGetUserNode]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            flowDetails: {
                                flowName: 'updateServer',
                                flowStatus: flowStatuses.started
                            },
                            isCompleted: true,
                            completeTime: startUpdateServerAction.flowStatusCompleteTime,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'updateServer',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    isCompleted: true,
                                    completeTime: selfResolvedUpdateServerAction.flowStatusCompleteTime,
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'updateServer',
                                                flowStatus: flowStatuses.completed
                                            },
                                            isCompleted: true,
                                            completeTime: completeUpdateServerAction.flowStatusCompleteTime,
                                            childs: [selfResolvedGetUserNode]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                })
            }
        ],
        nonActiveWorkflowsDetails: []
    };

    const expectedSelfResolvedGetUserNode = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: flowStatuses.selfResolved
        },
        isCompleted: true,
        completeTime: selfResolvedGetUserAction.flowStatusCompleteTime,
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                isCompleted: true,
                completeTime: completeGetUserAction.flowStatusCompleteTime,
                childs: []
            }
        ]
    };
    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflow1Action.workflowId,
                    workflowName: startWorkflow1Action.workflowName,
                    workflowStatus: workflowStatuses.started,
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        isCompleted: true,
                        completeTime: startGetUserAction.flowStatusCompleteTime,
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                isCompleted: true,
                                completeTime: startCreateUserAction.flowStatusCompleteTime,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        isCompleted: true,
                                        completeTime: selfResolvedCreateUserAction.flowStatusCompleteTime,
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                isCompleted: true,
                                                completeTime: completeCreateUserAction.flowStatusCompleteTime,
                                                childs: [expectedSelfResolvedGetUserNode]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                flowDetails: {
                                    flowName: 'updateServer',
                                    flowStatus: flowStatuses.started
                                },
                                isCompleted: true,
                                completeTime: startUpdateServerAction.flowStatusCompleteTime,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        isCompleted: true,
                                        completeTime: selfResolvedUpdateServerAction.flowStatusCompleteTime,
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                isCompleted: true,
                                                completeTime: completeUpdateServerAction.flowStatusCompleteTime,
                                                childs: [expectedSelfResolvedGetUserNode]
                                            }
                                        ]
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
            Cmd.run(functions.completeWorkflowsFunctions[startWorkflow1Action.workflowName], {
                successActionCreator: () => completeWorkflow1Action,
                args: [startWorkflowAction.workflowId]
            })
        ])
    );
    const actualResult = createReducer(functions, workflowsDetails)(state, action);
    assertLoopsEqual(t)(actualResult, expectedResult);
});

test('test 6 - dispatch the last flow action in the workflow - no complete workflow function', t => {
    const action = completeGetUserAction;
    const selfResolvedGetUserNode = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: flowStatuses.selfResolved
        },
        isCompleted: true,
        completeTime: selfResolvedGetUserAction.flowStatusCompleteTime,
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                childs: []
            }
        ]
    };
    const state = {
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflow1Action.workflowId,
                workflowName: startWorkflow1Action.workflowName,
                workflowStatus: workflowStatuses.started,
                head: Optional.of({
                    flowDetails: {
                        flowName: 'getUser',
                        flowStatus: flowStatuses.started
                    },
                    isCompleted: true,
                    completeTime: startGetUserAction.flowStatusCompleteTime,
                    childs: [
                        {
                            flowDetails: {
                                flowName: 'createUser',
                                flowStatus: flowStatuses.started
                            },
                            isCompleted: true,
                            completeTime: startCreateUserAction.flowStatusCompleteTime,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'createUser',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    isCompleted: true,
                                    completeTime: selfResolvedCreateUserAction.flowStatusCompleteTime,
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'createUser',
                                                flowStatus: flowStatuses.completed
                                            },
                                            isCompleted: true,
                                            completeTime: completeCreateUserAction.flowStatusCompleteTime,
                                            childs: [selfResolvedGetUserNode]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            flowDetails: {
                                flowName: 'updateServer',
                                flowStatus: flowStatuses.started
                            },
                            isCompleted: true,
                            completeTime: startUpdateServerAction.flowStatusCompleteTime,
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'updateServer',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    isCompleted: true,
                                    completeTime: selfResolvedUpdateServerAction.flowStatusCompleteTime,
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'updateServer',
                                                flowStatus: flowStatuses.completed
                                            },
                                            isCompleted: true,
                                            completeTime: completeUpdateServerAction.flowStatusCompleteTime,
                                            childs: [selfResolvedGetUserNode]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                })
            }
        ],
        nonActiveWorkflowsDetails: []
    };

    const expectedSelfResolvedGetUserNode = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: flowStatuses.selfResolved
        },
        isCompleted: true,
        completeTime: selfResolvedGetUserAction.flowStatusCompleteTime,
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                isCompleted: true,
                completeTime: completeGetUserAction.flowStatusCompleteTime,
                childs: []
            }
        ]
    };
    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflow1Action.workflowId,
                    workflowName: startWorkflow1Action.workflowName,
                    workflowStatus: workflowStatuses.started,
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        isCompleted: true,
                        completeTime: startGetUserAction.flowStatusCompleteTime,
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                isCompleted: true,
                                completeTime: startCreateUserAction.flowStatusCompleteTime,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        isCompleted: true,
                                        completeTime: selfResolvedCreateUserAction.flowStatusCompleteTime,
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                isCompleted: true,
                                                completeTime: completeCreateUserAction.flowStatusCompleteTime,
                                                childs: [expectedSelfResolvedGetUserNode]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                flowDetails: {
                                    flowName: 'updateServer',
                                    flowStatus: flowStatuses.started
                                },
                                isCompleted: true,
                                completeTime: startUpdateServerAction.flowStatusCompleteTime,
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        isCompleted: true,
                                        completeTime: selfResolvedUpdateServerAction.flowStatusCompleteTime,
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                isCompleted: true,
                                                completeTime: completeUpdateServerAction.flowStatusCompleteTime,
                                                childs: [expectedSelfResolvedGetUserNode]
                                            }
                                        ]
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
            Cmd.action(completeWorkflow1Action)
        ])
    );
    const actualResult = createReducer({
        startWorkflowsFunctions: {
            workflow1: customParams => console.log('Started Flow', customParams, 'workflow1'),
        },
        flowsFunctions: {
            createUser: customParams => console.log('Middle', customParams, 'createUser'),
            removeUser: customParams => console.log('Middle', customParams, 'removeUser'),
            updateServer: customParams => console.log('Middle', customParams, 'updateServer'),
            getUser: customParams => console.log('Middle', customParams, 'getUser')
        },
        completeWorkflowsFunctions: {
        },
    }, workflowsDetails)(state, action);
    assertLoopsEqual(t)(actualResult, expectedResult);
});