const nodeStatus = {
    notStarted: 1,
    shouldStart: 2,
    succeed: 3,
    failed: 4
};

const flowStatus = {
    started: 1,
    selfResolved: 2,
    succeed: 3
};

export {nodeStatus, flowStatus};