export default {
    startWorkflowsFunctions: {
        createUser: customParams => console.log('Started Flow', customParams, 'createUser'),
        updateServer: customParams => console.log('Started Flow', customParams, 'updateServer'),
        createSuperUser: customParams => console.log('Started Flow', customParams, 'createSuperUser'),
        delete: customParams => console.log('Started Flow', customParams, 'delete')
    },
    flows: {
        createUser: {
            task: customParams => console.log('Middle', customParams, 'createUser'),
            cancellation: {
                beforeSelfResolved: customParams => console.log('Cancel flow', 'beforeSelfResolved', customParams, 'createUser'),
                beforeCompleted: customParams => console.log('Cancel flow', 'beforeCompleted', customParams, 'createUser'),
            }
        },
        removeUser: {
            task: customParams => console.log('Middle', customParams, 'removeUser'),
            cancellation: {
                beforeSelfResolved: customParams => console.log('Cancel flow', 'beforeSelfResolved', customParams, 'removeUser'),
                beforeCompleted: customParams => console.log('Cancel flow', 'beforeCompleted', customParams, 'removeUser'),
            }
        },
        updateServer: {
            task: customParams => console.log('Middle', customParams, 'updateServer'),
            cancellation: {
                beforeSelfResolved: customParams => console.log('Cancel flow', 'beforeSelfResolved', customParams, 'updateServer'),
                beforeCompleted: customParams => console.log('Cancel flow', 'beforeCompleted', customParams, 'updateServer'),
            }
        },
        getUser: {
            task: customParams => console.log('Middle', customParams, 'getUser'),
            cancellation: {
                beforeSelfResolved: customParams => console.log('Cancel flow', 'beforeSelfResolved', customParams, 'getUser'),
                beforeCompleted: customParams => console.log('Cancel flow', 'beforeCompleted', customParams, 'getUser'),
            }
        }
    },
    completeWorkflowsFunctions: {
        createUser: customParams => console.log('Completed Flow', customParams, 'createUser'),
        updateServer: customParams => console.log('Completed Flow', customParams, 'updateServer'),
        createSuperUser: customParams => console.log('Completed Flow', customParams, 'createSuperUser'),
        delete: customParams => console.log('Completed Flow', customParams, 'delete')
    }
};