import {assertEqualFlows, createFlows, createTestFlows} from '../utils';

test('1', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: graph,
  });
  const actual = [
    'a',
    {
      name: 'b',
      graph: 'a',
      extends_flows: ['a'],
    },
  ];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'b',
      graph: [{a: [[], []]}],
    },
    {
      graph: [{a: [[], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createTestFlows(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});