export default {
    startWorkflowsFunctions: {
        workflow1: customParams => console.log('Started Flow', customParams, 'workflow1'),
    },
    flows: {
        createUser: {
            task: customParams => console.log('Middle', customParams, 'createUser'),
            cancellation: {
                beforeSelfResolved: customParams => console.log('Cancel', 'beforeSelfResolved', customParams, 'createUser'),
                beforeCompleted: customParams => console.log('Cancel', 'beforeCompleted', customParams, 'createUser'),
            }
        },
        removeUser: {
            task: customParams => console.log('Middle', customParams, 'removeUser'),
            cancellation: {
                beforeSelfResolved: customParams => console.log('Cancel', 'beforeSelfResolved', customParams, 'removeUser'),
                beforeCompleted: customParams => console.log('Cancel', 'beforeCompleted', customParams, 'removeUser'),
            }
        },
        updateServer: {
            task: customParams => console.log('Middle', customParams, 'updateServer'),
            cancellation: {
                beforeSelfResolved: customParams => console.log('Cancel', 'beforeSelfResolved', customParams, 'updateServer'),
                beforeCompleted: customParams => console.log('Cancel', 'beforeCompleted', customParams, 'updateServer'),
            }
        },
        getUser: {
            task: customParams => console.log('Middle', customParams, 'getUser'),
            cancellation: {
                beforeSelfResolved: customParams => console.log('Cancel', 'beforeSelfResolved', customParams, 'getUser'),
                beforeCompleted: customParams => console.log('Cancel', 'beforeCompleted', customParams, 'getUser'),
            }
        }
    },
    completeWorkflowsFunctions: {
        workflow1: customParams => console.log('Completed Flow', customParams, 'workflow1'),
    },
};