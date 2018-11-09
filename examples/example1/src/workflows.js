export default {
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
    workflows:{
        createUser:{
            started: customParams => console.log('Started Flow', customParams, 'createUser'),
            completed: customParams => console.log('Completed Flow', customParams, 'createUser'),
            cancellation: customParams => console.log('Cancel workflow', customParams, 'createUser')
        },
        updateServer:{
            started: customParams => console.log('Started Flow', customParams, 'updateServer'),
            completed: customParams => console.log('Completed Flow', customParams, 'updateServer'),
            cancellation: customParams => console.log('Cancel workflow', customParams, 'updateServer')
        },
        createSuperUser:{
            started: customParams => console.log('Started Flow', customParams, 'createSuperUser'),
            completed: customParams => console.log('Completed Flow', customParams, 'createSuperUser'),
            cancellation: customParams => console.log('Cancel workflow', customParams, 'createSuperUser')
        },
        delete:{
            started: customParams => console.log('Started Flow', customParams, 'delete'),
            completed: customParams => console.log('Completed Flow', customParams, 'delete'),
            cancellation: customParams => console.log('Cancel workflow', customParams, 'delete')
        }
    },
};