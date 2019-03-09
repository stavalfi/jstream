import {assertEqualFlows, createFlows, createTestFlows} from '../utils';

const flowsConfig = graph => ({
  splitters: {
    extends: '_',
    identifier: '/',
  },
  flows: [
    {
      graph: ['a'],
      extends_flows: [graph],
    },
  ],
});

// check that specifying identifier under config/splitters doesn't cause any problems.
test('1', () => {
  const actual = 'flow0';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow0',
      graph: [{flow0_a: [[], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createTestFlows(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('2', () => {
  const actual = 'flow0/123';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow0',
      graph: [{flow0_a: [[], []]}],
    },
    {
      graph: [{'flow0_a/123': [[], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createTestFlows(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('3', () => {
  const actual = 'flow0/flow0';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow0',
      graph: [{flow0_a: [[], []]}],
    },
    {
      graph: [{'flow0_a/flow0': [[], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createTestFlows(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('4', () => {
  const actual = 'flow0/1:flow1/1';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow0',
      graph: [{flow0_a: [[], []]}],
    },
    {
      name: 'flow1',
      graph: [{flow1_a: [[], []]}],
    },
    {
      graph: [{'flow0_a/1': [[], [1]]}, {'flow1_a/1': [[0], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createTestFlows(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('5', () => {
  const actual = 'flow0/1:flow0/2';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow0',
      graph: [{flow0_a: [[], []]}],
    },
    {
      graph: [{'flow0_a/1': [[], [1]]}, {'flow0_a/2': [[0], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createTestFlows(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('6', () => {
  const actual = ['flow/0:flow/1,flow/2', 'flow/1:flow/2'];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow',
      graph: [{flow_a: [[], []]}],
    },
    {
      graph: [{'flow_a/0': [[], [1, 2]]}, {'flow_a/1': [[0], [2]]}, {'flow_a/2': [[0, 1], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createTestFlows(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});
