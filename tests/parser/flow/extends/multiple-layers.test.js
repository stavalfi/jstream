import {assertEqualFlows, createFlows, createExpected} from '../../utils';

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
      extendedFlowIndex: 0,
    },
    {
      name: 'c',
      graph: [{c_b_a: [[], []]}],
      extendedFlowIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_b_a: [[], []]}],
      extendedFlowIndex: 2,
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

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
      extendedFlowIndex: 0,
    },
    {
      name: 'c',
      graph: [{c_b_a: [[], []]}],
      extendedFlowIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_b_a: [[], []]}],
      extendedFlowIndex: 2,
    },
    {
      name: 'flow1',
      graph: [{flow1_c_b_a: [[], []]}],
      extendedFlowIndex: 2,
    },
    {
      graph: [{flow0_c_b_a: [[1], [1]]}, {flow1_c_b_a: [[0], [0]]}],
      extendedFlowIndex: 2,
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('3', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: ['a', graph],
  });

  const actual = {
    name: 'flow1',
    graph: 'a',
  };
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow1',
      graph: [{flow1_a: [[], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('4', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: [
      'a',
      {
        name: 'flow1',
        graph: 'a',
        extends_flows: [graph],
      },
    ],
  });

  const actual = 'b';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow1',
      graph: [{flow1_a: [[], []]}],
    },
    {
      name: 'b',
      graph: [{b_flow1_a: [[], []]}],
      extendedFlowIndex: 1,
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('5', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: [
      'a',
      {
        name: 'b',
        graph: 'a',
        extends_flows: ['flow1', 'flow2', graph],
      },
    ],
  });
  const actual = {
    name: 'composed-flow',
    graph: ['flow1:flow2'],
    default_flow_name: 'flow2',
  };
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
      name: 'flow1',
      graph: [{flow1_b_a: [[], []]}],
      extendedFlowIndex: 1,
    },
    {
      name: 'flow2',
      graph: [{flow2_b_a: [[], []]}],
      extendedFlowIndex: 1,
    },
    {
      name: 'composed-flow',
      defaultFlowName: 'flow2',
      graph: [{'composed-flow_flow1_b_a': [[], [1]]}, {'composed-flow_flow2_b_a': [[0], []]}],
      extendedFlowIndex: 1,
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});
