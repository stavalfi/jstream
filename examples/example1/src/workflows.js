export default {
    flows: {
        createUser: {
            task: (workflowId, operations, userCustomParamObject) => console.log('Middle', workflowId, operations, userCustomParamObject, 'createUser', 'start')
        },
        removeUser: {
            task: (workflowId, operations, userCustomParamObject) => console.log('Middle', workflowId, operations, userCustomParamObject, 'removeUser')
        },
        updateServer: {
            task: (workflowId, operations, userCustomParamObject) => console.log('Middle', workflowId, operations, userCustomParamObject, 'updateServer')
        },
        getUser: {
            task: (workflowId, operations, userCustomParamObject) => console.log('Middle', workflowId, operations, userCustomParamObject, 'getUser')
        }
    }
};