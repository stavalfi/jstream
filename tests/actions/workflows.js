export default {
    flows: {
        a: {
            task: (workflowId, operations, userCustomParamObject) => console.log('Middle', workflowId, operations, userCustomParamObject, 'createUser', 'start')
        },
        b: {
            task: (workflowId, operations, userCustomParamObject) => console.log('Middle', workflowId, operations, userCustomParamObject, 'removeUser')
        },
        c: {
            task: (workflowId, operations, userCustomParamObject) => console.log('Middle', workflowId, operations, userCustomParamObject, 'updateServer')
        },
        d: {
            task: (workflowId, operations, userCustomParamObject) => console.log('Middle', workflowId, operations, userCustomParamObject, 'getUser')
        }
    }
};