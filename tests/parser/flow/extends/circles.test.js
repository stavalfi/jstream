import {assertEqualFlows, createFlows, createExpected, declareFlows} from '../../utils';

const flowsConfig = graph => ({
  splitters: {
    extends: '_',
  },
  flows: [
    {
      graph: ['a'],
      extends_flows: [graph],
    },
  ],
});

test('1', () => {
  const actual = {
    name: 'composed-flow',
    graph: 'flow0:flow1:flow0',
  };
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    ...declareFlows(2, ['flow', 'a'], '_'),
    {
      name: 'composed-flow',
      graph: [{'composed-flow_flow0_a': [[1], [1]]}, {'composed-flow_flow1_a': [[0], [0]]}],
    },
  ];
  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('2', () => {
  const actual = {
    name: 'composed-flow',
    graph: 'flow0:flow1:flow0:flow0',
  };
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    ...declareFlows(2, ['flow', 'a'], '_'),
    {
      name: 'composed-flow',
      graph: [{'composed-flow_flow0_a': [[1], [1]]}, {'composed-flow_flow1_a': [[0], [0]]}],
    },
  ];
  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('3', () => {
  const actual = {
    name: 'composed-flow',
    graph: 'flow0,flow1:flow1,flow0',
  };
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    ...declareFlows(2, ['flow', 'a'], '_'),
    {
      name: 'composed-flow',
      graph: [{'composed-flow_flow0_a': [[1], [1]]}, {'composed-flow_flow1_a': [[0], [0]]}],
    },
  ];
  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('3', () => {
  const actual = {
    name: 'composed-flow',
    graph: ['flow0:flow1_a:flow0'],
  };
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    ...declareFlows(2, ['flow', 'a'], '_'),
    {
      name: 'composed-flow',
      graph: [{'composed-flow_flow0_a': [[1], [1]]}, {'composed-flow_flow1_a': [[0], [0]]}],
    },
  ];
  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('4', () => {
  const actual = {
    name: 'composed-flow',
    graph: ['flow0_a:flow1:flow0'],
  };
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    ...declareFlows(2, ['flow', 'a'], '_'),
    {
      name: 'composed-flow',
      graph: [{'composed-flow_flow0_a': [[1], [1]]}, {'composed-flow_flow1_a': [[0], [0]]}],
    },
  ];
  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('5', () => {
  const actual = {
    name: 'composed-flow',
    graph: ['flow0:flow1_a', 'flow1:flow0_a'],
  };
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    ...declareFlows(2, ['flow', 'a'], '_'),
    {
      name: 'composed-flow',
      graph: [{'composed-flow_flow0_a': [[1], [1]]}, {'composed-flow_flow1_a': [[0], [0]]}],
    },
  ];
  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('6', () => {
  const actual = {
    name: 'composed-flow',
    graph: 'flow0:flow0',
  };
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    ...declareFlows(1, ['flow', 'a'], '_'),
    {
      name: 'composed-flow',
      graph: [{'composed-flow_flow0_a': [[], []]}],
      defaultNodeIndex: 0,
    },
  ];
  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('7', () => {
  const actual = {
    name: 'flow0',
    graph: 'flow0:flow0',
  };
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    ...declareFlows(1, ['flow', 'a'], '_'),
  ];
  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});
