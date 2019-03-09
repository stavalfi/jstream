import {assertEqualFlows, createFlows, createTestFlows} from '../utils';

test('1', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: [
      {
        graph: ['a'],
        extends_flows: [
          {
            graph: ['b'],
            extends_flows: [
              {
                graph: ['c'],
                extends_flows: [graph],
              },
            ],
          },
        ],
      },
    ],
  });
  const actual = 'flow0';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'b',
      graph: [{b_a: [[], []]}],
    },
    {
      name: 'c',
      graph: [{c_b_a: [[], []]}],
    },
    {
      name: 'flow0',
      graph: [{flow0_c_b_a: [[], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createTestFlows(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('2', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: [
      {
        graph: ['a'],
        extends_flows: [
          {
            graph: ['b'],
            extends_flows: [
              {
                graph: ['c'],
                extends_flows: [graph],
              },
            ],
          },
        ],
      },
    ],
  });
  const actual = 'flow0:flow1:flow0:flow1:flow0:flow0:flow1:flow1';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'b',
      graph: [{b_a: [[], []]}],
    },
    {
      name: 'c',
      graph: [{c_b_a: [[], []]}],
    },
    {
      name: 'flow0',
      graph: [{flow0_c_b_a: [[], []]}],
    },
    {
      name: 'flow1',
      graph: [{flow1_c_b_a: [[], []]}],
    },
    {
      graph: [{flow0_c_b_a: [[1], [1]]}, {flow1_c_b_a: [[0], [0]]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createTestFlows(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});
