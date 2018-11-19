export default (state, workflowId) => ({
    concurrentExecutions: () => state + '' + workflowId
});