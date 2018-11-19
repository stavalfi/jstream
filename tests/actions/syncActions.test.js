import test from 'ava';
import {
    changeFlowStatusToSelfResolvedAction,
    changeFlowStatusAction,
    generateActionsToDispatch,
} from '../../src/actions';
import Optional from 'optional-js';
import {activeFlowStatus, flowStatus, workflowStatus} from '../../src/statuses';

/* eslint fp/no-nil:0 */

const flowFunctions = {
    createUser: {
        task: customParams => console.log('Middle', customParams, 'createUser', 'start')
    },
    removeUser: {
        task: customParams => console.log('Middle', customParams, 'removeUser')
    },
    updateServer: {
        task: customParams => console.log('Middle', customParams, 'updateServer')
    },
    getUser: {
        task: customParams => console.log('Middle', customParams, 'getUser')
    }
};

test('1. find what actions to dispatch now - the first node: workflowStatus.started', t => {
    const activeWorkflowsDetails = [
        {
            workflowId: 'id1',
            workflowName: 'createUser',
            workflowStatusesHistory: [
                {
                    status: workflowStatus.started,
                    time: 0
                }
            ],
            head: Optional.of({
                flowDetails: {
                    flowName: 'createUser',
                    flowStatus: flowStatus.started
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: 0
                    },
                    {
                        status: activeFlowStatus.shouldStart,
                        time: 0
                    }
                ],
                childs: [
                    {
                        flowDetails: {
                            flowName: 'createUser',
                            flowStatus: flowStatus.selfResolved
                        },
                        nodeStatusesHistory: [
                            {
                                status: activeFlowStatus.notStarted,
                                time: 0
                            }
                        ],
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatus.completed
                                },
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: 0
                                    }
                                ],
                                childs: []
                            }
                        ]
                    }
                ]
            })
        }
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionsToDispatch(
        'id1',
        activeWorkflowsDetails,
        flowFunctions,
        dispatchTime
    );

    const expectedActionsToDispatch = [
        changeFlowStatusAction('id1', 'createUser', dispatchTime, flowStatus.started)
    ];
    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('2. find what actions to dispatch now - the second node: workflowStatus.selfResolved', t => {
    const activeWorkflowsDetails = [
        {
            workflowId: 'id1',
            workflowName: 'createUser',
            workflowStatusesHistory: [
                {
                    status: workflowStatus.started,
                    time: 0
                }
            ],
            head: Optional.of({
                flowDetails: {
                    flowName: 'createUser',
                    flowStatus: flowStatus.started
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: 0
                    },
                    {
                        status: activeFlowStatus.shouldStart,
                        time: 0
                    },
                    {
                        status: activeFlowStatus.completed,
                        time: 1
                    }
                ],
                childs: [
                    {
                        flowDetails: {
                            flowName: 'createUser',
                            flowStatus: flowStatus.selfResolved
                        },
                        nodeStatusesHistory: [
                            {
                                status: activeFlowStatus.notStarted,
                                time: 0
                            },
                            {
                                status: activeFlowStatus.shouldStart,
                                time: 1
                            }
                        ],
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatus.completed
                                },
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: 0
                                    }
                                ],
                                childs: []
                            }
                        ]
                    }
                ]
            })
        }
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionsToDispatch(
        'id1',
        activeWorkflowsDetails,
        flowFunctions,
        dispatchTime
    );

    const expectedActionsToDispatch = [
        changeFlowStatusToSelfResolvedAction('id1', 'createUser', dispatchTime, flowFunctions.createUser.task)
    ];
    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('3. find what actions to dispatch now - the second node: workflowStatus.completed', t => {
    const activeWorkflowsDetails = [
        {
            workflowId: 'id1',
            workflowName: 'createUser',
            workflowStatusesHistory: [
                {
                    status: workflowStatus.started,
                    time: 0
                }
            ],
            head: Optional.of({
                flowDetails: {
                    flowName: 'createUser',
                    flowStatus: flowStatus.started
                },
                nodeStatusesHistory: [
                    {
                        status: activeFlowStatus.notStarted,
                        time: 0
                    },
                    {
                        status: activeFlowStatus.shouldStart,
                        time: 0
                    },
                    {
                        status: activeFlowStatus.completed,
                        time: 1
                    }
                ],
                childs: [
                    {
                        flowDetails: {
                            flowName: 'createUser',
                            flowStatus: flowStatus.selfResolved
                        },
                        nodeStatusesHistory: [
                            {
                                status: activeFlowStatus.notStarted,
                                time: 0
                            },
                            {
                                status: activeFlowStatus.shouldStart,
                                time: 1
                            },
                            {
                                status: activeFlowStatus.completed,
                                time: 2
                            }
                        ],
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: flowStatus.completed
                                },
                                nodeStatusesHistory: [
                                    {
                                        status: activeFlowStatus.notStarted,
                                        time: 0
                                    },
                                    {
                                        status: activeFlowStatus.shouldStart,
                                        time: 2
                                    }
                                ],
                                childs: []
                            }
                        ]
                    }
                ]
            })
        }
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionsToDispatch(
        'id1',
        activeWorkflowsDetails,
        flowFunctions,
        dispatchTime
    );

    const expectedActionsToDispatch = [
        changeFlowStatusAction('id1', 'createUser', dispatchTime, flowStatus.completed)
    ];
    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});