export default {
    // NOTE: there are no repeats of stateNames inside flowStateMachine (for supporting unidirectional flows).
    // it means that when checking who are the children of a leaf in the real graph,
    // i only need to check if the leaf is the leaf in this graph and if yes,
    // i will check by the rules. if not, he doesn't have childs.
    defaultTransition: ['start', 'succeed'],
    defaultTransitionLogic: (currentWorkflowState, workflowStateMachine, currentLogicState, logicStateMachine) =>
        (workflowId, state, workflowParam) =>
            flowLogic => ({
                result: flowLogic(workflowId, state, workflowParam),
                error: flowLogic(workflowId, state, workflowParam),
                nextWorkflowState: workflowStateMachine[currentWorkflowState],
                nextLogicState: logicStateMachine[currentLogicState],
            }),
    // conditions for flowStateMachine:
    // 1. flowStateMachine must be well formatted. it means: arrays only in the leafs.
    // 2. it must have one head but a child is not mandatory..
    // 3. no repeats. -> because we want unidirectional flows && workflows ONLY
    flowStateMachine: {
        'shouldStart': [
            'failed',
            'canceled',
            'succeed',
        ]
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
    flows: [
        {
            name: 'manageUser',
            statesLogic: [
                {
                    stateName: 'shouldStart',
                    logic: (workflowId, state, workflowParam) => console.log(workflowId, state, workflowParam)
                }
            ]
        },
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
        'createUser',
        // {
        //     name: 'removeUser',
        //     workflow: 'removeUser'
        // },
        // {
        //     name: 'removeUser',
        //     workflow: {
        //         'removeUser_shouldStart': ['removeUser_failed', 'removeUser_canceled', 'removeUser_succeed']
        //     }
        // },
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
        //     name: 'createUser5',
        //     workflow: {
        //         'createUser_shouldStart': [
        //             {
        //                 'a_2': [
        //                     {
        //                         'a_3': 'a_4' // dad === 'a_4'
        //                     }
        //                 ]
        //             },
        //             {
        //                 'createUser_succeed': {
        //                     'manageUser': 'searchUser'
        //                 },
        //             },
        //             {
        //                 'createUser_failed': {
        //                     [['manageUser', 'searchUser']]: 'updateUser'
        //                 },
        //             },
        //             {
        //                 'createUser_canceled': {
        //                     'manageUser': {
        //                         'searchUser': {
        //                             'manageUser_shouldStart': {
        //                                 'manageUser_succeed': 'searchUser',
        //                                 'manageUser_failed': 'searchUser'
        //                             }
        //                         }
        //                     }
        //                 }
        //             }
        //         ]
        //     }
        // }
    ]
};