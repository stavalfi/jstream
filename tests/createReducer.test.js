import test from 'ava';
import {Cmd, loop} from 'redux-loop';
import createReducer from '../src/createReducer';
import readWorkflowsFile from '../src/workflowsJSONReader';
import {workflowActionCreator, flowActionCreator} from '../src/actionsCreators';
import flowStatuses from '../src/statuses/flowStatuses';
import workflowStatuses from '../src/statuses/workflowStatuses';
import Maybe from 'maybe';

/* eslint fp/no-nil:0 */

const assertLoopsEqual = t => (expectedLoop, actualLoop) => {
    t.deepEqual(actualLoop[0], expectedLoop[0]);
};

test('test 1 - start a workflow', t => {
    const {workflowsDetails} = readWorkflowsFile({
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    });
    const flowsFunctions = {
        getUser: () => console.log('____TEST____')
    };
    const getUserFlowName = 'getUser';
    const startWorkflowAction = workflowActionCreator(getUserFlowName);

    const actualResult = createReducer(flowsFunctions, workflowsDetails)({
        activeWorkflowsDetails: [],
        nonActiveWorkflowsDetails: []
    }, startWorkflowAction);

    const expectedResult = loop({
            activeWorkflowsDetails: [
                {
                    workflowId: startWorkflowAction.workflowId,
                    workflowName: startWorkflowAction.workflowName,
                    workflowStatus: workflowStatuses.started,
                    head: Maybe({
                        flowDetails: {
                            flowName: getUserFlowName,
                            flowStatus: flowStatuses.started
                        },
                        childs: [
                            {
                                flowDetails: {
                                    flowName: getUserFlowName,
                                    flowStatus: flowStatuses.selfResolved
                                },
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: getUserFlowName,
                                            flowStatus: flowStatuses.completed
                                        },
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
            Cmd.run(flowsFunctions.getUser, {
                successActionCreator: () => flowActionCreator(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.started),
                args: [startWorkflowAction.workflowId]
            })
        ])
    );
    assertLoopsEqual(t)(actualResult, expectedResult);
});

test('test 2 - start the flow', t => {
    const {workflowsDetails} = readWorkflowsFile({
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    });
    const flowsFunctions = {
        getUser: () => console.log('____TEST____')
    };
    const getUserFlowName = 'getUser';
    const startWorkflowAction = workflowActionCreator(getUserFlowName);
    const startFlowAction = flowActionCreator(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.started);

    const actualResult = createReducer(flowsFunctions, workflowsDetails)({
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflowAction.workflowId,
                workflowName: startWorkflowAction.workflowName,
                workflowStatus: workflowStatuses.started,
                head: Maybe({
                    flowDetails: {
                        flowName: getUserFlowName,
                        flowStatus: flowStatuses.started
                    },
                    childs: [
                        {
                            flowDetails: {
                                flowName: getUserFlowName,
                                flowStatus: flowStatuses.selfResolved
                            },
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: getUserFlowName,
                                        flowStatus: flowStatuses.completed
                                    },
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
                    head: Maybe({
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
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: getUserFlowName,
                                            flowStatus: flowStatuses.completed
                                        },
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
            Cmd.run(flowsFunctions.getUser, {
                successActionCreator: () => flowActionCreator(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.selfResolved),
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
    const flowsFunctions = {
        getUser: () => console.log('____TEST____')
    };
    const getUserFlowName = 'getUser';
    const startWorkflowAction = workflowActionCreator(getUserFlowName);
    const startFlowAction = flowActionCreator(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.started);
    const selfResolvedAction = flowActionCreator(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.selfResolved);

    const actualResult = createReducer(flowsFunctions, workflowsDetails)({
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflowAction.workflowId,
                workflowName: startWorkflowAction.workflowName,
                workflowStatus: workflowStatuses.started,
                head: Maybe({
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
                            childs: [
                                {
                                    flowDetails: {
                                        flowName: getUserFlowName,
                                        flowStatus: flowStatuses.completed
                                    },
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
                    head: Maybe({
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
            Cmd.action(flowActionCreator(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.completed))
        ])
    );
    assertLoopsEqual(t)(actualResult, expectedResult);
});

test('test 4 - complete the flow', t => {
    const {workflowsDetails} = readWorkflowsFile({
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    });
    const flowsFunctions = {
        getUser: () => console.log('____TEST____')
    };
    const getUserFlowName = 'getUser';
    const startWorkflowAction = workflowActionCreator(getUserFlowName);
    const startFlowAction = flowActionCreator(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.started);
    const selfResolvedAction = flowActionCreator(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.selfResolved);
    const completeAction = flowActionCreator(startWorkflowAction.workflowId, getUserFlowName, flowStatuses.completed);

    const actualResult = createReducer(flowsFunctions, workflowsDetails)({
        activeWorkflowsDetails: [
            {
                workflowId: startWorkflowAction.workflowId,
                workflowName: startWorkflowAction.workflowName,
                workflowStatus: workflowStatuses.started,
                head: Maybe({
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
            activeWorkflowsDetails: [],
            nonActiveWorkflowsDetails: [
                {
                    workflowId: startWorkflowAction.workflowId,
                    workflowName: startWorkflowAction.workflowName,
                    workflowStatus: workflowStatuses.completed,
                    completeTime: completeAction.flowStatusCompleteTime,
                    head: Maybe({
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