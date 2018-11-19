import test from 'ava';
import readWorkflowsFile from '../src/parser';
import Optional from 'optional-js';
/* eslint fp/no-nil:0 */

test('test 1', t => {
    const workflows = {
        'flowsNames': ['getUser'],
        'workflowsDetails': ['getUser']
    };
    const {flowsNames, workflowsDetails} = readWorkflowsFile(workflows);
    t.deepEqual(flowsNames, ['getUser']);

    const firstWorkflowName = 'getUser';
    const firstWorkflowHead = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: 1
        },
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: 2
                },
                childs: [
                    {
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: 3
                        },
                        childs: []
                    }
                ]
            }
        ]
    };
    t.true(workflowsDetails[0].head.isPresent());
    t.is(workflowsDetails[0].workflowName, firstWorkflowName);
    t.deepEqual(workflowsDetails[0].head.get(), firstWorkflowHead);
});

test('test 2', t => {
    const workflows = {
        'flowsNames': ['getUser'],
        'workflowsDetails': [
            {
                'workflowName': 'createSuperUser',
                'workflow': [
                    'getUser_1',
                    'getUser_2',
                    'getUser_3'
                ]
            }
        ]
    };
    const {flowsNames, workflowsDetails} = readWorkflowsFile(workflows);
    t.deepEqual(flowsNames, ['getUser']);

    const firstWorkflowName = 'createSuperUser';
    const firstWorkflowHead = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: 1
        },
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: 2
                },
                childs: [
                    {
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: 3
                        },
                        childs: []
                    }
                ]
            }
        ]
    };
    t.true(workflowsDetails[0].head.isPresent());
    t.is(workflowsDetails[0].workflowName, firstWorkflowName);
    t.deepEqual(workflowsDetails[0].head.get(), firstWorkflowHead);
});

test('test 3', t => {
    const workflows = {
        'flowsNames': [
            'updateServer',
            'getUser'
        ],
        'workflowsDetails': [
            {
                'workflowName': 'createSuperUser',
                'workflow': [
                    'getUser_1',
                    'updateServer',
                    'getUser_2',
                    'getUser_3'
                ]
            }
        ]
    };
    const {flowsNames, workflowsDetails} = readWorkflowsFile(workflows);
    t.deepEqual(flowsNames, ['updateServer', 'getUser']);

    const firstWorkflowName = 'createSuperUser';
    const firstWorkflowHead = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: 1
        },
        childs: [
            {
                flowDetails: {
                    flowName: 'updateServer',
                    flowStatus: 1
                },
                childs: [
                    {
                        flowDetails: {
                            flowName: 'updateServer',
                            flowStatus: 2
                        },
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'updateServer',
                                    flowStatus: 3
                                },
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'getUser',
                                            flowStatus: 2
                                        },
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'getUser',
                                                    flowStatus: 3
                                                },
                                                childs: []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
    t.true(workflowsDetails[0].head.isPresent());
    t.is(workflowsDetails[0].workflowName, firstWorkflowName);
    t.deepEqual(workflowsDetails[0].head.get(), firstWorkflowHead);
});

test('test 4', t => {
    const workflows = {
        'flowsNames': [
            'updateServer',
            'getUser',
            'getSomething'
        ],
        'workflowsDetails': [
            {
                'workflowName': 'createSuperUser',
                'workflow': [
                    'getUser_1',
                    'updateServer_1',
                    'updateServer_2',
                    'getSomething',
                    'updateServer_3',
                    'getUser_2',
                    'getUser_3'
                ]
            }
        ]
    };
    const {flowsNames, workflowsDetails} = readWorkflowsFile(workflows);
    t.deepEqual(flowsNames, ['updateServer', 'getUser', 'getSomething']);

    const firstWorkflowName = 'createSuperUser';
    const firstWorkflowHead = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: 1
        },
        childs: [
            {
                flowDetails: {
                    flowName: 'updateServer',
                    flowStatus: 1
                },
                childs: [
                    {
                        flowDetails: {
                            flowName: 'updateServer',
                            flowStatus: 2
                        },
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'getSomething',
                                    flowStatus: 1
                                },
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'getSomething',
                                            flowStatus: 2
                                        },
                                        childs: [
                                            {
                                                flowDetails: {
                                                    flowName: 'getSomething',
                                                    flowStatus: 3
                                                },
                                                childs: [
                                                    {
                                                        flowDetails: {
                                                            flowName: 'updateServer',
                                                            flowStatus: 3
                                                        },
                                                        childs: [
                                                            {
                                                                flowDetails: {
                                                                    flowName: 'getUser',
                                                                    flowStatus: 2
                                                                },
                                                                childs: [
                                                                    {
                                                                        flowDetails: {
                                                                            flowName: 'getUser',
                                                                            flowStatus: 3
                                                                        },
                                                                        childs: []
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
    t.true(workflowsDetails[0].head.isPresent());
    t.is(workflowsDetails[0].workflowName, firstWorkflowName);
    t.deepEqual(workflowsDetails[0].head.get(), firstWorkflowHead);
});

test('test 5', t => {
    const workflows = {
        'flowsNames': [
            'getUser',
        ],
        'workflowsDetails': [
            {
                'workflowName': 'workflow1',
                'workflow': [
                    'workflow2'
                ]
            },
            {
                'workflowName': 'workflow2',
                'workflow': [
                    'getUser'
                ]
            },
        ]
    };
    const {flowsNames, workflowsDetails} = readWorkflowsFile(workflows);
    t.deepEqual(flowsNames, ['getUser']);
    const expectedWorkflowDetails = [
        {
            workflowName: 'workflow1',
            head: Optional.of({
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: 1
                },
                childs: [
                    {
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: 2
                        },
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'getUser',
                                    flowStatus: 3
                                },
                                childs: []
                            }
                        ]
                    }
                ]
            })
        },
        {
            workflowName: 'workflow2',
            head: Optional.of({
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: 1
                },
                childs: [
                    {
                        flowDetails: {
                            flowName: 'getUser',
                            flowStatus: 2
                        },
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'getUser',
                                    flowStatus: 3
                                },
                                childs: []
                            }
                        ]
                    }
                ]
            })
        }
    ];
    t.deepEqual(workflowsDetails, expectedWorkflowDetails);
});

test('test 6 - multiple flows (in parallel) between start and self-resolved', t => {
    const workflows = {
        'flowsNames': [
            'getUser',
            'createUser',
            'updateServer'
        ],
        'workflowsDetails': [
            {
                'workflowName': 'workflow1',
                'workflow': [
                    'getUser_1',
                    'createUser',
                    'updateServer',
                    'getUser_2',
                    'getUser_3'
                ]
            }
        ]
    };
    const {flowsNames, workflowsDetails} = readWorkflowsFile(workflows);
    t.deepEqual(flowsNames, ['getUser', 'createUser', 'updateServer']);
    const getUserSelfResolvedNode = {
        flowDetails: {
            flowName: 'getUser',
            flowStatus: 2
        },
        childs: [
            {
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: 3
                },
                childs: []
            }
        ]
    };
    const expectedWorkflowDetails = [
        {
            workflowName: 'workflow1',
            head: Optional.of({
                flowDetails: {
                    flowName: 'getUser',
                    flowStatus: 1
                },
                childs: [
                    {
                        flowDetails: {
                            flowName: 'createUser',
                            flowStatus: 1
                        },
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'createUser',
                                    flowStatus: 2
                                },
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'createUser',
                                            flowStatus: 3
                                        },
                                        childs: [
                                            getUserSelfResolvedNode
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        flowDetails: {
                            flowName: 'updateServer',
                            flowStatus: 1
                        },
                        childs: [
                            {
                                flowDetails: {
                                    flowName: 'updateServer',
                                    flowStatus: 2
                                },
                                childs: [
                                    {
                                        flowDetails: {
                                            flowName: 'updateServer',
                                            flowStatus: 3
                                        },
                                        childs: [
                                            getUserSelfResolvedNode
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            })
        }
    ];
    t.deepEqual(workflowsDetails, expectedWorkflowDetails);
});