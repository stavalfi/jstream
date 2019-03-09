import {assertEqualFlows, createExpected, createWorkflows} from '../utils';

const flowsConfig = ({flows, workflows}) => ({
  splitters: {
    extends: '_',
  },
  flows,
  workflows,
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

  const actualFlows = createWorkflows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});
