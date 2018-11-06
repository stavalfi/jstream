const createUser = customParams => console.log('WOW!!!!', customParams, 'createUser');
const removeUser = customParams => console.log('WOW!!!!', customParams, 'removeUser');
const updateServer = customParams => console.log('WOW!!!!', customParams, 'updateServer');
const getUser = customParams => console.log('WOW!!!!', customParams, 'getUser');

export default {
    startWorkflowsFunctions: {},
    flowsFunctions: {createUser, removeUser, updateServer, getUser},
    completeWorkflowsFunctions: {}
};