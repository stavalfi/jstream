import test from 'ava';
import {Cmd, loop} from 'redux-loop';
import createReducer from '../../../src/reducer/createReducer';
import readWorkflowsFile from '../../../src/json/parser';
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
import activeFlowStatus from '../../../src/statuses/activeFlowStatus';

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
        nodeStatusesHistory: [
            {
                status: activeFlowStatus.notStarted,
                time: startWorkflow1Action.startWorkflowTime
            }
        ],
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: startWorkflow1Action.startWorkflowTime
                    }
                ],
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
                    workflowStatusesHistory: [
                        {
                            status: workflowStatuses.started,
                            time: startWorkflow1Action.startWorkflowTime
                        }
                    ],
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        nodeStatusesHistory: [
                            {
                                status: activeFlowStatus.notStarted,
                                time: startWorkflow1Action.startWorkflowTime
                            },
                            {
                                status: activeFlowStatus.shouldStart,
                                time: startWorkflow1Action.startWorkflowTime
                            }
                        ],
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    }
                                                ],
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
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    }
                                                ],
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
            Cmd.run(functions.workflows[startWorkflow1Action.workflowName].started, {
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
        nodeStatusesHistory: [
            {
                status: activeFlowStatus.notStarted,
                time: startWorkflow1Action.startWorkflowTime
            }
        ],
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: startWorkflow1Action.startWorkflowTime
                    }
                ],
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
                    workflowStatusesHistory: [
                        {
                            status: workflowStatuses.started,
                            time: startWorkflow1Action.startWorkflowTime
                        }
                    ],
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        nodeStatusesHistory: [
                            {
                                status: activeFlowStatus.notStarted,
                                time: startWorkflow1Action.startWorkflowTime
                            },
                            {
                                status: activeFlowStatus.shouldStart,
                                time: startWorkflow1Action.startWorkflowTime
                            }
                        ],
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    }
                                                ],
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
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    }
                                                ],
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
        flows: {
            createUser: {
                task: customParams => console.log('Middle', customParams, 'createUser'),
            },
            removeUser: {
                task: customParams => console.log('Middle', customParams, 'removeUser'),
            },
            updateServer: {
                task: customParams => console.log('Middle', customParams, 'updateServer'),
            },
            getUser: {
                task: customParams => console.log('Middle', customParams, 'getUser'),
            }
        },
        workflows: {
            workflow1: {
                completed: customParams => console.log('Completed Flow', customParams, 'workflow1'),
                cancellation: customParams => console.log('Cancel workflow', customParams, 'workflow1')
            }
        }
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
        nodeStatusesHistory: [
            {
                status: activeFlowStatus.notStarted,
                time: startWorkflow1Action.startWorkflowTime
            }
        ],
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: startWorkflow1Action.startWorkflowTime
                    }
                ],
                childs: []
            }
        ]
    };
    const state = {
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflow1Action.workflowId,
                workflowName: startWorkflow1Action.workflowName,
                workflowStatusesHistory: [
                    {
                        status: workflowStatuses.started,
                        time: startWorkflow1Action.startWorkflowTime
                    }
                ],
                head: Optional.of({
                    flowDetails: {
                        flowName: 'getUser',
                        flowStatus: flowStatuses.started
                    },
                    nodeStatusesHistory: [
                        {
                            status: activeFlowStatus.notStarted,
                            time: startWorkflow1Action.startWorkflowTime
                        },
                        {
                            status: activeFlowStatus.shouldStart,
                            time: startWorkflow1Action.startWorkflowTime
                        },
                        {
                            status: activeFlowStatus.completed,
                            time: startGetUserAction.flowStatusCompleteTime
                        }
                    ],
                    childs: [
                        {
                            flowDetails: {
                                flowName: 'createUser',
                                flowStatus: flowStatuses.started
                            },
                            nodeStatusesHistory: [
                                {
                                    status: activeFlowStatus.notStarted,
                                    time: startWorkflow1Action.startWorkflowTime
                                },
                                {
                                    status: activeFlowStatus.shouldStart,
                                    time: startGetUserAction.flowStatusCompleteTime
                                },
                                {
                                    status: activeFlowStatus.completed,
                                    time: startCreateUserAction.flowStatusCompleteTime
                                }
                            ],
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'createUser',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    nodeStatusesHistory: [
                                        {
                                            status: activeFlowStatus.notStarted,
                                            time: startWorkflow1Action.startWorkflowTime
                                        },
                                        {
                                            status: activeFlowStatus.shouldStart,
                                            time: startCreateUserAction.flowStatusCompleteTime
                                        },
                                        {
                                            status: activeFlowStatus.completed,
                                            time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                        }
                                    ],
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'createUser',
                                                flowStatus: flowStatuses.completed
                                            },
                                            nodeStatusesHistory: [
                                                {
                                                    status: activeFlowStatus.notStarted,
                                                    time: startWorkflow1Action.startWorkflowTime
                                                },
                                                {
                                                    status: activeFlowStatus.shouldStart,
                                                    time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                                }
                                            ],
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
                            nodeStatusesHistory: [
                                {
                                    status: activeFlowStatus.notStarted,
                                    time: startWorkflow1Action.startWorkflowTime
                                },
                                {
                                    status: activeFlowStatus.shouldStart,
                                    time: startGetUserAction.flowStatusCompleteTime
                                },
                                {
                                    status: activeFlowStatus.completed,
                                    time: startUpdateServerAction.flowStatusCompleteTime
                                }
                            ],
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'updateServer',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    nodeStatusesHistory: [
                                        {
                                            status: activeFlowStatus.notStarted,
                                            time: startWorkflow1Action.startWorkflowTime
                                        },
                                        {
                                            status: activeFlowStatus.shouldStart,
                                            time: startUpdateServerAction.flowStatusCompleteTime
                                        },
                                        {
                                            status: activeFlowStatus.completed,
                                            time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                        }
                                    ],
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'updateServer',
                                                flowStatus: flowStatuses.completed
                                            },
                                            nodeStatusesHistory: [
                                                {
                                                    status: activeFlowStatus.notStarted,
                                                    time: startWorkflow1Action.startWorkflowTime
                                                },
                                                {
                                                    status: activeFlowStatus.shouldStart,
                                                    time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                                },
                                            ],
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
                    workflowStatusesHistory: [
                        {
                            status: workflowStatuses.started,
                            time: startWorkflow1Action.startWorkflowTime
                        }
                    ],
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        nodeStatusesHistory: [
                            {
                                status: activeFlowStatus.notStarted,
                                time: startWorkflow1Action.startWorkflowTime
                            },
                            {
                                status: activeFlowStatus.shouldStart,
                                time: startWorkflow1Action.startWorkflowTime
                            },
                            {
                                status: activeFlowStatus.completed,
                                time: startGetUserAction.flowStatusCompleteTime
                            }
                        ],
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    },
                                    {
                                        status: activeFlowStatus.shouldStart,
                                        time: startGetUserAction.flowStatusCompleteTime
                                    },
                                    {
                                        status: activeFlowStatus.completed,
                                        time: startCreateUserAction.flowStatusCompleteTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            },
                                            {
                                                status: activeFlowStatus.shouldStart,
                                                time: startCreateUserAction.flowStatusCompleteTime
                                            },
                                            {
                                                status: activeFlowStatus.completed,
                                                time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.shouldStart,
                                                        time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.completed,
                                                        time: completeCreateUserAction.flowStatusCompleteTime
                                                    }
                                                ],
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
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    },
                                    {
                                        status: activeFlowStatus.shouldStart,
                                        time: startGetUserAction.flowStatusCompleteTime
                                    },
                                    {
                                        status: activeFlowStatus.completed,
                                        time: startUpdateServerAction.flowStatusCompleteTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            },
                                            {
                                                status: activeFlowStatus.shouldStart,
                                                time: startUpdateServerAction.flowStatusCompleteTime
                                            },
                                            {
                                                status: activeFlowStatus.completed,
                                                time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.shouldStart,
                                                        time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                                    }
                                                ],
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
    const selfResolvedGetUserNodeInitial = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: flowStatuses.selfResolved
        },
        nodeStatusesHistory: [
            {
                status: activeFlowStatus.notStarted,
                time: startWorkflow1Action.startWorkflowTime
            }
        ],
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: startWorkflow1Action.startWorkflowTime
                    }
                ],
                childs: []
            }
        ]
    };
    const state = {
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflow1Action.workflowId,
                workflowName: startWorkflow1Action.workflowName,
                workflowStatusesHistory: [
                    {
                        status: workflowStatuses.started,
                        time: startWorkflow1Action.startWorkflowTime
                    }
                ],
                head: Optional.of({
                    flowDetails: {
                        flowName: 'getUser',
                        flowStatus: flowStatuses.started
                    },
                    nodeStatusesHistory: [
                        {
                            status: activeFlowStatus.notStarted,
                            time: startWorkflow1Action.startWorkflowTime
                        },
                        {
                            status: activeFlowStatus.shouldStart,
                            time: startWorkflow1Action.startWorkflowTime
                        },
                        {
                            status: activeFlowStatus.completed,
                            time: startGetUserAction.flowStatusCompleteTime
                        }
                    ],
                    childs: [
                        {
                            flowDetails: {
                                flowName: 'createUser',
                                flowStatus: flowStatuses.started
                            },
                            nodeStatusesHistory: [
                                {
                                    status: activeFlowStatus.notStarted,
                                    time: startWorkflow1Action.startWorkflowTime
                                },
                                {
                                    status: activeFlowStatus.shouldStart,
                                    time: startGetUserAction.flowStatusCompleteTime
                                },
                                {
                                    status: activeFlowStatus.completed,
                                    time: startCreateUserAction.flowStatusCompleteTime
                                }
                            ],
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'createUser',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    nodeStatusesHistory: [
                                        {
                                            status: activeFlowStatus.notStarted,
                                            time: startWorkflow1Action.startWorkflowTime
                                        },
                                        {
                                            status: activeFlowStatus.shouldStart,
                                            time: startCreateUserAction.flowStatusCompleteTime
                                        },
                                        {
                                            status: activeFlowStatus.completed,
                                            time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                        }
                                    ],
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'createUser',
                                                flowStatus: flowStatuses.completed
                                            },
                                            nodeStatusesHistory: [
                                                {
                                                    status: activeFlowStatus.notStarted,
                                                    time: startWorkflow1Action.startWorkflowTime
                                                },
                                                {
                                                    status: activeFlowStatus.shouldStart,
                                                    time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                                },
                                                {
                                                    status: activeFlowStatus.completed,
                                                    time: completeCreateUserAction.flowStatusCompleteTime
                                                }
                                            ],
                                            childs: [selfResolvedGetUserNodeInitial]
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
                            nodeStatusesHistory: [
                                {
                                    status: activeFlowStatus.notStarted,
                                    time: startWorkflow1Action.startWorkflowTime
                                },
                                {
                                    status: activeFlowStatus.shouldStart,
                                    time: startGetUserAction.flowStatusCompleteTime
                                },
                                {
                                    status: activeFlowStatus.completed,
                                    time: startUpdateServerAction.flowStatusCompleteTime
                                }
                            ],
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'updateServer',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    nodeStatusesHistory: [
                                        {
                                            status: activeFlowStatus.notStarted,
                                            time: startWorkflow1Action.startWorkflowTime
                                        },
                                        {
                                            status: activeFlowStatus.shouldStart,
                                            time: startUpdateServerAction.flowStatusCompleteTime
                                        },
                                        {
                                            status: activeFlowStatus.completed,
                                            time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                        }
                                    ],
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'updateServer',
                                                flowStatus: flowStatuses.completed
                                            },
                                            nodeStatusesHistory: [
                                                {
                                                    status: activeFlowStatus.notStarted,
                                                    time: startWorkflow1Action.startWorkflowTime
                                                },
                                                {
                                                    status: activeFlowStatus.shouldStart,
                                                    time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                                }
                                            ],
                                            childs: [selfResolvedGetUserNodeInitial]
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

    const selfResolvedGetUserNodeExpected = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: flowStatuses.selfResolved
        },
        nodeStatusesHistory: [
            {
                status: activeFlowStatus.notStarted,
                time: startWorkflow1Action.startWorkflowTime
            },
            {
                status: activeFlowStatus.shouldStart,
                time: completeUpdateServerAction.flowStatusCompleteTime
            }
        ],
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: startWorkflow1Action.startWorkflowTime
                    }
                ],
                childs: []
            }
        ]
    };

    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflow1Action.workflowId,
                    workflowName: startWorkflow1Action.workflowName,
                    workflowStatusesHistory: [
                        {
                            status: workflowStatuses.started,
                            time: startWorkflow1Action.startWorkflowTime
                        }
                    ],
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        nodeStatusesHistory: [
                            {
                                status: activeFlowStatus.notStarted,
                                time: startWorkflow1Action.startWorkflowTime
                            },
                            {
                                status: activeFlowStatus.shouldStart,
                                time: startWorkflow1Action.startWorkflowTime
                            },
                            {
                                status: activeFlowStatus.completed,
                                time: startGetUserAction.flowStatusCompleteTime
                            }
                        ],
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    },
                                    {
                                        status: activeFlowStatus.shouldStart,
                                        time: startGetUserAction.flowStatusCompleteTime
                                    },
                                    {
                                        status: activeFlowStatus.completed,
                                        time: startCreateUserAction.flowStatusCompleteTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            },
                                            {
                                                status: activeFlowStatus.shouldStart,
                                                time: startCreateUserAction.flowStatusCompleteTime
                                            },
                                            {
                                                status: activeFlowStatus.completed,
                                                time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.shouldStart,
                                                        time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.completed,
                                                        time: completeCreateUserAction.flowStatusCompleteTime
                                                    }
                                                ],
                                                childs: [selfResolvedGetUserNodeExpected]
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
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    },
                                    {
                                        status: activeFlowStatus.shouldStart,
                                        time: startGetUserAction.flowStatusCompleteTime
                                    },
                                    {
                                        status: activeFlowStatus.completed,
                                        time: startUpdateServerAction.flowStatusCompleteTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            },
                                            {
                                                status: activeFlowStatus.shouldStart,
                                                time: startUpdateServerAction.flowStatusCompleteTime
                                            },
                                            {
                                                status: activeFlowStatus.completed,
                                                time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.shouldStart,
                                                        time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.completed,
                                                        time: completeUpdateServerAction.flowStatusCompleteTime
                                                    }
                                                ],
                                                childs: [selfResolvedGetUserNodeExpected]
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
            Cmd.run(functions.flows.getUser.task, {
                successActionCreator: () => selfResolvedGetUserAction,
                args: [startWorkflow1Action.workflowId]
            })
        ])
    );
    const actualResult = createReducer(functions, workflowsDetails)(state, action);
    assertLoopsEqual(t)(actualResult, expectedResult);
});

test('test 5 - dispatch the last flow action in the workflow - there is a complete workflow function', t => {
    const action = completeGetUserAction;
    const selfResolvedGetUserNodeInitial = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: flowStatuses.selfResolved
        },
        nodeStatusesHistory: [
            {
                status: activeFlowStatus.notStarted,
                time: startWorkflow1Action.startWorkflowTime
            },
            {
                status: activeFlowStatus.shouldStart,
                time: completeCreateUserAction.flowStatusCompleteTime
            },
            {
                status: activeFlowStatus.completed,
                time: selfResolvedGetUserAction.flowStatusCompleteTime
            }
        ],
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: startWorkflow1Action.startWorkflowTime
                    },
                    {
                        status: activeFlowStatus.shouldStart,
                        time: selfResolvedGetUserAction.flowStatusCompleteTime
                    }
                ],
                childs: []
            }
        ]
    };
    const state = {
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflow1Action.workflowId,
                workflowName: startWorkflow1Action.workflowName,
                workflowStatusesHistory: [
                    {
                        status: workflowStatuses.started,
                        time: startWorkflow1Action.startWorkflowTime
                    }
                ],
                head: Optional.of({
                    flowDetails: {
                        flowName: 'getUser',
                        flowStatus: flowStatuses.started
                    },
                    nodeStatusesHistory: [
                        {
                            status: activeFlowStatus.notStarted,
                            time: startWorkflow1Action.startWorkflowTime
                        },
                        {
                            status: activeFlowStatus.shouldStart,
                            time: startWorkflow1Action.startWorkflowTime
                        },
                        {
                            status: activeFlowStatus.completed,
                            time: startGetUserAction.flowStatusCompleteTime
                        }
                    ],
                    childs: [
                        {
                            flowDetails: {
                                flowName: 'createUser',
                                flowStatus: flowStatuses.started
                            },
                            nodeStatusesHistory: [
                                {
                                    status: activeFlowStatus.notStarted,
                                    time: startWorkflow1Action.startWorkflowTime
                                },
                                {
                                    status: activeFlowStatus.shouldStart,
                                    time: startGetUserAction.flowStatusCompleteTime
                                },
                                {
                                    status: activeFlowStatus.completed,
                                    time: startCreateUserAction.flowStatusCompleteTime
                                }
                            ],
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'createUser',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    nodeStatusesHistory: [
                                        {
                                            status: activeFlowStatus.notStarted,
                                            time: startWorkflow1Action.startWorkflowTime
                                        },
                                        {
                                            status: activeFlowStatus.shouldStart,
                                            time: startCreateUserAction.flowStatusCompleteTime
                                        },
                                        {
                                            status: activeFlowStatus.completed,
                                            time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                        }
                                    ],
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'createUser',
                                                flowStatus: flowStatuses.completed
                                            },
                                            nodeStatusesHistory: [
                                                {
                                                    status: activeFlowStatus.notStarted,
                                                    time: startWorkflow1Action.startWorkflowTime
                                                },
                                                {
                                                    status: activeFlowStatus.shouldStart,
                                                    time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                                },
                                                {
                                                    status: activeFlowStatus.completed,
                                                    time: completeCreateUserAction.flowStatusCompleteTime
                                                }
                                            ],
                                            childs: [selfResolvedGetUserNodeInitial]
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
                            nodeStatusesHistory: [
                                {
                                    status: activeFlowStatus.notStarted,
                                    time: startWorkflow1Action.startWorkflowTime
                                },
                                {
                                    status: activeFlowStatus.shouldStart,
                                    time: startGetUserAction.flowStatusCompleteTime
                                },
                                {
                                    status: activeFlowStatus.completed,
                                    time: startUpdateServerAction.flowStatusCompleteTime
                                }
                            ],
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'updateServer',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    nodeStatusesHistory: [
                                        {
                                            status: activeFlowStatus.notStarted,
                                            time: startWorkflow1Action.startWorkflowTime
                                        },
                                        {
                                            status: activeFlowStatus.shouldStart,
                                            time: startUpdateServerAction.flowStatusCompleteTime
                                        },
                                        {
                                            status: activeFlowStatus.completed,
                                            time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                        }
                                    ],
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'updateServer',
                                                flowStatus: flowStatuses.completed
                                            },
                                            nodeStatusesHistory: [
                                                {
                                                    status: activeFlowStatus.notStarted,
                                                    time: startWorkflow1Action.startWorkflowTime
                                                },
                                                {
                                                    status: activeFlowStatus.shouldStart,
                                                    time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                                },
                                                {
                                                    status: activeFlowStatus.completed,
                                                    time: completeUpdateServerAction.flowStatusCompleteTime
                                                }
                                            ],
                                            childs: [selfResolvedGetUserNodeInitial]
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
        nodeStatusesHistory: [
            {
                status: activeFlowStatus.notStarted,
                time: startWorkflow1Action.startWorkflowTime
            },
            {
                status: activeFlowStatus.shouldStart,
                time: completeCreateUserAction.flowStatusCompleteTime
            },
            {
                status: activeFlowStatus.completed,
                time: selfResolvedGetUserAction.flowStatusCompleteTime
            }
        ],
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: startWorkflow1Action.startWorkflowTime
                    },
                    {
                        status: activeFlowStatus.shouldStart,
                        time: selfResolvedGetUserAction.flowStatusCompleteTime
                    },
                    {
                        status: activeFlowStatus.completed,
                        time: completeGetUserAction.flowStatusCompleteTime
                    }
                ],
                childs: []
            }
        ]
    };
    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflow1Action.workflowId,
                    workflowName: startWorkflow1Action.workflowName,
                    workflowStatusesHistory: [
                        {
                            status: workflowStatuses.started,
                            time: startWorkflow1Action.startWorkflowTime
                        }
                    ],
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        nodeStatusesHistory: [
                            {
                                status: activeFlowStatus.notStarted,
                                time: startWorkflow1Action.startWorkflowTime
                            },
                            {
                                status: activeFlowStatus.shouldStart,
                                time: startWorkflow1Action.startWorkflowTime
                            },
                            {
                                status: activeFlowStatus.completed,
                                time: startGetUserAction.flowStatusCompleteTime
                            }
                        ],
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    },
                                    {
                                        status: activeFlowStatus.shouldStart,
                                        time: startGetUserAction.flowStatusCompleteTime
                                    },
                                    {
                                        status: activeFlowStatus.completed,
                                        time: startCreateUserAction.flowStatusCompleteTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            },
                                            {
                                                status: activeFlowStatus.shouldStart,
                                                time: startCreateUserAction.flowStatusCompleteTime
                                            },
                                            {
                                                status: activeFlowStatus.completed,
                                                time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.shouldStart,
                                                        time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.completed,
                                                        time: completeCreateUserAction.flowStatusCompleteTime
                                                    }
                                                ],
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
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    },
                                    {
                                        status: activeFlowStatus.shouldStart,
                                        time: startGetUserAction.flowStatusCompleteTime
                                    },
                                    {
                                        status: activeFlowStatus.completed,
                                        time: startUpdateServerAction.flowStatusCompleteTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            },
                                            {
                                                status: activeFlowStatus.shouldStart,
                                                time: startUpdateServerAction.flowStatusCompleteTime
                                            },
                                            {
                                                status: activeFlowStatus.completed,
                                                time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.shouldStart,
                                                        time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.completed,
                                                        time: completeUpdateServerAction.flowStatusCompleteTime
                                                    }
                                                ],
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
            Cmd.run(functions.workflows[startWorkflow1Action.workflowName].completed, {
                successActionCreator: () => completeWorkflow1Action,
                args: [startWorkflow1Action.workflowId]
            })
        ])
    );
    const actualResult = createReducer(functions, workflowsDetails)(state, action);
    assertLoopsEqual(t)(actualResult, expectedResult);
});

test('test 6 - dispatch the last flow action in the workflow - no complete workflow function', t => {
    const action = completeGetUserAction;
    const selfResolvedGetUserNodeInitial = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: flowStatuses.selfResolved
        },
        nodeStatusesHistory: [
            {
                status: activeFlowStatus.notStarted,
                time: startWorkflow1Action.startWorkflowTime
            },
            {
                status: activeFlowStatus.shouldStart,
                time: completeCreateUserAction.flowStatusCompleteTime
            },
            {
                status: activeFlowStatus.completed,
                time: selfResolvedGetUserAction.flowStatusCompleteTime
            }
        ],
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: startWorkflow1Action.startWorkflowTime
                    },
                    {
                        status: activeFlowStatus.shouldStart,
                        time: selfResolvedGetUserAction.flowStatusCompleteTime
                    }
                ],
                childs: []
            }
        ]
    };
    const state = {
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflow1Action.workflowId,
                workflowName: startWorkflow1Action.workflowName,
                workflowStatusesHistory: [
                    {
                        status: workflowStatuses.started,
                        time: startWorkflow1Action.startWorkflowTime
                    }
                ],
                head: Optional.of({
                    flowDetails: {
                        flowName: 'getUser',
                        flowStatus: flowStatuses.started
                    },
                    nodeStatusesHistory: [
                        {
                            status: activeFlowStatus.notStarted,
                            time: startWorkflow1Action.startWorkflowTime
                        },
                        {
                            status: activeFlowStatus.shouldStart,
                            time: startWorkflow1Action.startWorkflowTime
                        },
                        {
                            status: activeFlowStatus.completed,
                            time: startGetUserAction.flowStatusCompleteTime
                        }
                    ],
                    childs: [
                        {
                            flowDetails: {
                                flowName: 'createUser',
                                flowStatus: flowStatuses.started
                            },
                            nodeStatusesHistory: [
                                {
                                    status: activeFlowStatus.notStarted,
                                    time: startWorkflow1Action.startWorkflowTime
                                },
                                {
                                    status: activeFlowStatus.shouldStart,
                                    time: startGetUserAction.flowStatusCompleteTime
                                },
                                {
                                    status: activeFlowStatus.completed,
                                    time: startCreateUserAction.flowStatusCompleteTime
                                }
                            ],
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'createUser',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    nodeStatusesHistory: [
                                        {
                                            status: activeFlowStatus.notStarted,
                                            time: startWorkflow1Action.startWorkflowTime
                                        },
                                        {
                                            status: activeFlowStatus.shouldStart,
                                            time: startCreateUserAction.flowStatusCompleteTime
                                        },
                                        {
                                            status: activeFlowStatus.completed,
                                            time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                        }
                                    ],
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'createUser',
                                                flowStatus: flowStatuses.completed
                                            },
                                            nodeStatusesHistory: [
                                                {
                                                    status: activeFlowStatus.notStarted,
                                                    time: startWorkflow1Action.startWorkflowTime
                                                },
                                                {
                                                    status: activeFlowStatus.shouldStart,
                                                    time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                                },
                                                {
                                                    status: activeFlowStatus.completed,
                                                    time: completeCreateUserAction.flowStatusCompleteTime
                                                }
                                            ],
                                            childs: [selfResolvedGetUserNodeInitial]
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
                            nodeStatusesHistory: [
                                {
                                    status: activeFlowStatus.notStarted,
                                    time: startWorkflow1Action.startWorkflowTime
                                },
                                {
                                    status: activeFlowStatus.shouldStart,
                                    time: startGetUserAction.flowStatusCompleteTime
                                },
                                {
                                    status: activeFlowStatus.completed,
                                    time: startUpdateServerAction.flowStatusCompleteTime
                                }
                            ],
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: 'updateServer',
                                        flowStatus: flowStatuses.selfResolved
                                    },
                                    nodeStatusesHistory: [
                                        {
                                            status: activeFlowStatus.notStarted,
                                            time: startWorkflow1Action.startWorkflowTime
                                        },
                                        {
                                            status: activeFlowStatus.shouldStart,
                                            time: startUpdateServerAction.flowStatusCompleteTime
                                        },
                                        {
                                            status: activeFlowStatus.completed,
                                            time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                        }
                                    ],
                                    childs: [
                                        {
                                            flowDetails: {
                                                flowName: 'updateServer',
                                                flowStatus: flowStatuses.completed
                                            },
                                            nodeStatusesHistory: [
                                                {
                                                    status: activeFlowStatus.notStarted,
                                                    time: startWorkflow1Action.startWorkflowTime
                                                },
                                                {
                                                    status: activeFlowStatus.shouldStart,
                                                    time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                                },
                                                {
                                                    status: activeFlowStatus.completed,
                                                    time: completeUpdateServerAction.flowStatusCompleteTime
                                                }
                                            ],
                                            childs: [selfResolvedGetUserNodeInitial]
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
        nodeStatusesHistory: [
            {
                status: activeFlowStatus.notStarted,
                time: startWorkflow1Action.startWorkflowTime
            },
            {
                status: activeFlowStatus.shouldStart,
                time: completeCreateUserAction.flowStatusCompleteTime
            },
            {
                status: activeFlowStatus.completed,
                time: selfResolvedGetUserAction.flowStatusCompleteTime
            }
        ],
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: flowStatuses.completed
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: startWorkflow1Action.startWorkflowTime
                    },
                    {
                        status: activeFlowStatus.shouldStart,
                        time: selfResolvedGetUserAction.flowStatusCompleteTime
                    },
                    {
                        status: activeFlowStatus.completed,
                        time: completeGetUserAction.flowStatusCompleteTime
                    }
                ],
                childs: []
            }
        ]
    };
    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflow1Action.workflowId,
                    workflowName: startWorkflow1Action.workflowName,
                    workflowStatusesHistory: [
                        {
                            status: workflowStatuses.started,
                            time: startWorkflow1Action.startWorkflowTime
                        }
                    ],
                    head: Optional.of({
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: flowStatuses.started
                        },
                        nodeStatusesHistory: [
                            {
                                status: activeFlowStatus.notStarted,
                                time: startWorkflow1Action.startWorkflowTime
                            },
                            {
                                status: activeFlowStatus.shouldStart,
                                time: startWorkflow1Action.startWorkflowTime
                            },
                            {
                                status: activeFlowStatus.completed,
                                time: startGetUserAction.flowStatusCompleteTime
                            }
                        ],
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatuses.started
                                },
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    },
                                    {
                                        status: activeFlowStatus.shouldStart,
                                        time: startGetUserAction.flowStatusCompleteTime
                                    },
                                    {
                                        status: activeFlowStatus.completed,
                                        time: startCreateUserAction.flowStatusCompleteTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            },
                                            {
                                                status: activeFlowStatus.shouldStart,
                                                time: startCreateUserAction.flowStatusCompleteTime
                                            },
                                            {
                                                status: activeFlowStatus.completed,
                                                time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'createUser',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.shouldStart,
                                                        time: selfResolvedCreateUserAction.flowStatusCompleteTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.completed,
                                                        time: completeCreateUserAction.flowStatusCompleteTime
                                                    }
                                                ],
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
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: startWorkflow1Action.startWorkflowTime
                                    },
                                    {
                                        status: activeFlowStatus.shouldStart,
                                        time: startGetUserAction.flowStatusCompleteTime
                                    },
                                    {
                                        status: activeFlowStatus.completed,
                                        time: startUpdateServerAction.flowStatusCompleteTime
                                    }
                                ],
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: flowStatuses.selfResolved
                                        },
                                        nodeStatusesHistory: [
                                            {
                                                status: activeFlowStatus.notStarted,
                                                time: startWorkflow1Action.startWorkflowTime
                                            },
                                            {
                                                status: activeFlowStatus.shouldStart,
                                                time: startUpdateServerAction.flowStatusCompleteTime
                                            },
                                            {
                                                status: activeFlowStatus.completed,
                                                time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                            }
                                        ],
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'updateServer',
                                                    flowStatus: flowStatuses.completed
                                                },
                                                nodeStatusesHistory: [
                                                    {
                                                        status: activeFlowStatus.notStarted,
                                                        time: startWorkflow1Action.startWorkflowTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.shouldStart,
                                                        time: selfResolvedUpdateServerAction.flowStatusCompleteTime
                                                    },
                                                    {
                                                        status: activeFlowStatus.completed,
                                                        time: completeUpdateServerAction.flowStatusCompleteTime
                                                    }
                                                ],
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
        workflows: {
            workflow1: {
                shouldStart: customParams => console.log('Started Flow', customParams, 'workflow1'),
                cancellation: customParams => console.log('Cancel workflow', customParams, 'workflow1')
            }
        },
        flows: {
            createUser: {
                task: customParams => console.log('Middle', customParams, 'createUser'),
            },
            removeUser: {
                task: customParams => console.log('Middle', customParams, 'removeUser'),
            },
            updateServer: {
                task: customParams => console.log('Middle', customParams, 'updateServer'),
            },
            getUser: {
                task: customParams => console.log('Middle', customParams, 'getUser'),
            }
        },
    }, workflowsDetails)(state, action);
    assertLoopsEqual(t)(actualResult, expectedResult);
});