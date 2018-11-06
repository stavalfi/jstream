export default {
    startWorkflowsFunctions: {
        createUser: customParams => console.log('Started Flow', customParams, 'createUser'),
        updateServer: customParams => console.log('Started Flow', customParams, 'updateServer'),
        createSuperUser: customParams => console.log('Started Flow', customParams, 'createSuperUser'),
        delete: customParams => console.log('Started Flow', customParams, 'delete')
    },
    flowsFunctions: {
        createUser: customParams => console.log('Middle', customParams, 'createUser'),
        removeUser: customParams => console.log('Middle', customParams, 'removeUser'),
        updateServer: customParams => console.log('Middle', customParams, 'updateServer'),
        getUser: customParams => console.log('Middle', customParams, 'getUser')
    },
    completeWorkflowsFunctions: {
        createUser: customParams => console.log('Completed Flow', customParams, 'createUser'),
        updateServer: customParams => console.log('Completed Flow', customParams, 'updateServer'),
        createSuperUser: customParams => console.log('Completed Flow', customParams, 'createSuperUser'),
        delete: customParams => console.log('Completed Flow', customParams, 'delete')
    },
};