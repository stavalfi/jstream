export default {
    priorityFlowStateMachine: {
        'shouldStart': 'succeed'
    },
    defaultTransition: (currentWorkflowState, workflowStateMachine, currentLogicState, logicStateMachine) =>
        (workflowId, state, workflowParam) =>
            flowLogic => ({
                result: flowLogic(workflowId, state, workflowParam),
                error: flowLogic(workflowId, state, workflowParam),
                nextWorkflowState: workflowStateMachine[currentWorkflowState],
                nextLogicState: logicStateMachine[currentLogicState],
            }),
    // conditions for flowStateMachine:
    // flowStateMachine must be well formatted.
    // it must have one head.
    // no repeats.
    // one node can have multiple childs but multiple node can't have the same child
    // it must have head and at least one child
    flowStateMachine: {
        'shouldStart': ['failed', 'canceled', 'succeed']
    },
    workflowStateMachine: [
        {
            name: 'shouldStart',
            children: ['failed', 'canceled', 'succeed'],
        },
        {
            name: 'failed',
            children: []
        },
        {
            name: 'canceled',
            children: []
        },
        {
            name: 'succeed',
            children: []
        }
    ],
    flow: [
        {
            name: 'createUser',
            statesLogic: [
                {
                    stateName: 'shouldStart',
                    logic: (workflowId, state, workflowParam) => console.log(workflowId, state, workflowParam)
                }
            ]
        },
        {
            name: 'removeUser',
            statesLogic: [
                {
                    stateName: 'shouldStart',
                    logic: (workflowId, state, workflowParam) => console.log(workflowId, state, workflowParam)
                }
            ]
        },
        {
            name: 'searchUser',
            statesLogic: [
                {
                    stateName: 'shouldStart',
                    logic: (workflowId, state, workflowParam) => console.log(workflowId, state, workflowParam)
                }
            ]
        },
        {
            name: 'updateUser',
            statesLogic: [
                {
                    stateName: 'shouldStart',
                    logic: (workflowId, state, workflowParam) => console.log(workflowId, state, workflowParam)
                }
            ]
        }
    ],
    workflows: [
        // 'createUser',
        // {
        //     name: 'removeUser',
        //     workflow: 'removeUser'
        // },
        {
            name: 'removeUser',
            workflow: {
                'removeUser_shouldStart': ['removeUser_failed', 'removeUser_canceled', 'removeUser_succeed']
            }
        },
        // {
        //     name: 'manageUser',
        //     workflow: {
        //         'createUser': 'removeUser'
        //     },
        //     transition: (currentWorkflowState, workflowStateMachine, currentLogicState, logicStateMachine) =>
        //         (workflowId, state, workflowParam) =>
        //             flowLogic => ({
        //                 result: flowLogic(workflowId, state, workflowParam),
        //                 error: flowLogic(workflowId, state, workflowParam),
        //                 nextWorkflowState: workflowStateMachine[currentWorkflowState],
        //                 nextLogicState: logicStateMachine[currentLogicState],
        //             })
        // },
        // {
        //     name: 'createUser5',
        //     workflow: {
        //         'createUser_shouldStart': {
        //             'createUser_succeed': {
        //                 'manageUser': 'searchUser'
        //             },
        //             'createUser_failed': {
        //                 [['manageUser', 'searchUser']]: 'updateUser'
        //             },
        //             'createUser_canceled': {
        //                 'manageUser': {
        //                     'searchUser': {
        //                         'manageUser_shouldStart': {
        //                             'manageUser_succeed': 'searchUser',
        //                             'manageUser_failed': 'searchUser'
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // },
        // {
        //     name: 'createUser6',
        //     workflow: {
        //         [['createUser_shouldStart']]: {
        //             [['createUser_succeed']]: {
        //                 [['manageUser']]: 'searchUser'
        //             },
        //             [['createUser_failed']]: {
        //                 [['manageUser', 'searchUser']]: 'updateUser'
        //             },
        //             [['createUser_canceled']]: {
        //                 [['manageUser', {
        //                     [['manageUser_shouldStart']]: 'manageUser_succeed'
        //                 }]]: {
        //                     [['searchUser']]: {
        //                         [['manageUser_shouldStart']]: {
        //                             [['manageUser_succeed']]: 'searchUser',
        //                             [['manageUser_failed']]: 'searchUser'
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
    ]
};