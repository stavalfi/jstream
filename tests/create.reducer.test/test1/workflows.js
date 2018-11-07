export default {
    startWorkflowsFunctions: {
        workflow1: customParams => console.log('Started Flow', customParams, 'workflow1'),
    },
    flowsFunctions: {
        createUser: customParams => console.log('Middle', customParams, 'createUser'),
        removeUser: customParams => console.log('Middle', customParams, 'removeUser'),
        updateServer: customParams => console.log('Middle', customParams, 'updateServer'),
        getUser: customParams => console.log('Middle', customParams, 'getUser')
    },
    completeWorkflowsFunctions: {
        workflow1: customParams => console.log('Completed Flow', customParams, 'workflow1'),
    },
};