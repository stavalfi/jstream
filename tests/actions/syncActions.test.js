import test from 'ava';
import createActiveWorkflow from '../utils/createActiveWorkflow/createActiveWorkflow';
import {flowStatus} from '../../src/statuses';
import workflowsJson from './workflows.json';
import functions from './workflows.js';
import {
    changeFlowStatusAction,
    changeFlowStatusToSelfResolvedAction,
    generateActionToDispatch
} from '../../src/actions';

/* eslint fp/no-nil:0 */
/* eslint fp/no-mutation:0 fp/no-let:0 */

test('1. find what actions to dispatch now - the first node: flowStatus.started', t => {
    const activeWorkflowsDetails = [createActiveWorkflow(workflowsJson, 'a')];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusAction(activeWorkflowsDetails[0].workflowId, 'a', dispatchTime, flowStatus.started);
    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('2. find what actions to dispatch now - the second node: flowStatus.selfResolved', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1_succeed',
                'a_2',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusToSelfResolvedAction(activeWorkflowsDetails[0].workflowId, 'a', dispatchTime, functions.flows.a.task);
    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('3. find what actions to dispatch now - the third node: flowStatus.succeed', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1',
                'a_2_succeed',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusAction(activeWorkflowsDetails[0].workflowId, 'a', dispatchTime, flowStatus.succeed);
    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('4. find what actions to dispatch now - after all nodes succeed -> there are no more nodes to start.', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1',
                'a_2',
                'a_3_succeed'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = undefined;
    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('5. find what actions to dispatch now - the activeWorkflowDetails object is not found', t => {
    const activeWorkflowsDetails = [];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        'not-exist-active-workflow-id',
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = undefined;
    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('6. find what actions to dispatch now - we need to trigger one node from different flow', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1_succeed',
                'b',
                'a_2',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusAction(activeWorkflowsDetails[0].workflowId, 'b', dispatchTime, flowStatus.started);
    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('7. find what actions to dispatch now - we need to trigger only one child', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1_succeed',
                'b',
                'c',
                'a_2',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusAction(activeWorkflowsDetails[0].workflowId, 'b', dispatchTime, flowStatus.started);

    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('8. we don`t need to trigger the next child yet', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1',
                'b_1_succeed',
                'b_2',
                'b_3',
                'c',
                'a_2',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusToSelfResolvedAction(activeWorkflowsDetails[0].workflowId, 'b', dispatchTime, functions.flows.b.task);

    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('9. we don`t need to trigger the next child yet', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1',
                'b_1',
                'b_2_succeed',
                'b_3',
                'c',
                'a_2',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusAction(activeWorkflowsDetails[0].workflowId, 'b', dispatchTime,flowStatus.succeed);

    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('10. we need to trigger the next child', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1',
                'b_1',
                'b_2',
                'b_3_succeed',
                'c',
                'a_2',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusAction(activeWorkflowsDetails[0].workflowId, 'c', dispatchTime,flowStatus.started);

    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('11. self resolve the next child', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1',
                'b_1',
                'b_2',
                'b_3_succeed',
                'c_1_succeed',
                'c_2',
                'c_3',
                'a_2',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusToSelfResolvedAction(activeWorkflowsDetails[0].workflowId, 'c', dispatchTime, functions.flows.c.task);

    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('12. complete the next child', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1',
                'b_1',
                'b_2',
                'b_3_succeed',
                'c_1',
                'c_2_succeed',
                'c_3',
                'a_2',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusAction(activeWorkflowsDetails[0].workflowId, 'c', dispatchTime, flowStatus.succeed);

    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});


test('13. find what actions to dispatch now - multiple inner flows succeed - so we need to trigger the outer flow - selfResolved', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1',
                'b_succeed',
                'c_succeed',
                'a_2',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusToSelfResolvedAction(activeWorkflowsDetails[0].workflowId, 'a', dispatchTime, functions.flows.a.task);

    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('14. find what actions to dispatch now - multiple inner flows succeed - so we need to trigger the outer flow - succeed', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1',
                'a_2',
                'b_succeed',
                'c_succeed',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusAction(activeWorkflowsDetails[0].workflowId, 'a', dispatchTime, flowStatus.succeed);

    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});

test('15. find what actions to dispatch now - (same flows more then once) multiple inner flows succeed - so we need to trigger the outer flow - succeed', t => {
    const activeWorkflowsDetails = [
        createActiveWorkflow(workflowsJson, {
            'workflowName': 'a',
            'workflow': [
                'a_1',
                'b',
                'c',
                'a_2',
                'b_succeed',
                'c_succeed',
                'a_3'
            ]
        })
    ];

    const dispatchTime = Date.now();

    const actualActionsToDispatch = generateActionToDispatch(
        activeWorkflowsDetails[0].workflowId,
        activeWorkflowsDetails,
        functions.flows,
        dispatchTime
    );

    const expectedActionsToDispatch = changeFlowStatusAction(activeWorkflowsDetails[0].workflowId, 'a', dispatchTime, flowStatus.succeed);

    t.deepEqual(actualActionsToDispatch, expectedActionsToDispatch);
});
