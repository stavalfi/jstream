export default {
    flows: {
        createUser: {
            task: customParams => console.log('Middle', customParams, 'createUser', 'start')
        },
        removeUser: {
            task: customParams => console.log('Middle', customParams, 'removeUser')
        },
        updateServer: {
            task: customParams => console.log('Middle', customParams, 'updateServer')
        },
        getUser: {
            task: customParams => console.log('Middle', customParams, 'getUser')
        }
    }
};