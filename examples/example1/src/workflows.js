const s = JSON.stringify

export default {
    // NOTE: there are no repeats of stateNames inside flowStateMachine (for supporting unidirectional flows).
    // it means that when checking who are the children of a leaf in the real graph,
    // i only need to check if the leaf is the leaf in this graph and if yes,
    // i will check by the rules. if not, he doesn't have childs.
    defaultTransition: ['shouldStart', 'succeed'],
    defaultTransitionLogic: (currentWorkflowState, workflowStateMachine, currentLogicState, logicStateMachine) =>
        (workflowId, state, workflowParam) =>
            flowLogic => ({
                result: flowLogic(workflowId, state, workflowParam),
                error: flowLogic(workflowId, state, workflowParam),
                nextWorkflowState: workflowStateMachine[currentWorkflowState],
                nextLogicState: logicStateMachine[currentLogicState],
            }),
    // conditions for flowStateMachine:
    // 1. it must have one head but a child is not mandatory..
    // 2. no repeats. -> because we want unidirectional flows && workflows ONLY
    // 3. it must be well formatted because im lazy and findChildrenOfState function is counting on it.
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
        // 'createUser',
        // {
        //     name: 'removeUser',
        //     workflow: 'removeUser'
        // },
        {
            name: 'manageUser',
            workflow: {
                'createUser': 'removeUser'
            },
            // transition: (currentWorkflowState, workflowStateMachine, currentLogicState, logicStateMachine) =>
            //     (workflowId, state, workflowParam) =>
            //         flowLogic => ({
            //             result: flowLogic(workflowId, state, workflowParam),
            //             error: flowLogic(workflowId, state, workflowParam),
            //             nextWorkflowState: workflowStateMachine[currentWorkflowState],
            //             nextLogicState: logicStateMachine[currentLogicState],
            //         })
        },
        // {
        //     name: 'workflow1',
        //     workflow: {
        //         'a': {
        //             [s({
        //                 [s({
        //                     'b': ['c']
        //                 })]: ['d']
        //             })]: ['e']
        //         }
        //     }
        // },
        // {
        //     name: 'a',
        //     workflow: {
        //         'a': {
        //             [s({'b': ['c']})]: 'd'
        //         }
        //     }
        // },
        // {
        //     name: 'a',
        //     workflow: {
        //         'a': {
        //             [s(['b1', 'b2'])]: ['c']
        //         }
        //     }
        // }
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
        //         'createUser1_shouldStart': [
        //             [1, 2, 3, 4,]
        //         ],
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
        //                     [s(['manageUser', 'searchUser'])]: 'updateUser'
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