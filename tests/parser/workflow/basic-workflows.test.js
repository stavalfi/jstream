import {assertEqualFlows, createExpected, createWorkflows} from '../utils';

const flowsConfig = ({flows, workflows, default_workflow_state_machine}) => ({
  splitters: {
    extends: '_',
  },
  flows,
  workflows,
  ...(default_workflow_state_machine && {default_workflow_state_machine}),
});

test('1', () => {
  const actual = {
    flows: ['a'],
    workflows: ['a'],
  };
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
  ];

  const actualWorkflows = createWorkflows(actual, flowsConfig);
  const expectedWorkflows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedWorkflows, actualWorkflows);
});

test('2', () => {
  const actual = {
    flows: ['a'],
    default_workflow_state_machine: 'a',
    workflows: ['a'],
  };
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
  ];

  const actualWorkflows = createWorkflows(actual, flowsConfig);
  const expectedWorkflows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedWorkflows, actualWorkflows);
});
