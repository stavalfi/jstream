import {assertEqualFlows, createFlows, createExpected} from '../../utils';

test('1', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: graph,
  });
  const actual = ['a', 'b'];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
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
    flows: graph,
  });
  const actual = ['a', 'b', 'a:b'];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      graph: [{a: [[], [1]]}, {b: [[0], []]}],
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
    flows: graph,
  });
  const actual = ['a', 'b', 'a:b'];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      graph: [{a: [[], [1]]}, {b: [[0], []]}],
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
    flows: graph,
  });
  const actual = ['a', 'b', 'b:a'];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      graph: [{b: [[], [1]]}, {a: [[0], []]}],
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
    flows: graph,
  });
  const actual = ['a', 'b', 'a:b:a:b'];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      graph: [{a: [[1], [1]]}, {b: [[0], [0]]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('6', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: graph,
  });
  const actual = ['a', 'b', 'b:a', 'a:b:a:b'];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      graph: [{b: [[], [1]]}, {a: [[0], []]}],
    },
    {
      graph: [{a: [[1], [1]]}, {b: [[0], [0]]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('7', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: graph,
  });
  const actual = [
    'a',
    'b',
    {
      name: 'c',
      graph: 'a:b',
    },
    'c_a:c_b',
  ];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'c',
      graph: [{c_a: [[], [1]]}, {c_b: [[0], []]}],
    },
    {
      graph: [{c_a: [[], [1]]}, {c_b: [[0], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('8', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: graph,
  });
  const actual = [
    'a',
    'b',
    {
      name: 'c',
      graph: 'a:b',
    },
    {
      graph: 'c_a:c_a',
    },
  ];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'c',
      graph: [{c_a: [[], [1]]}, {c_b: [[0], []]}],
    },
    {
      graph: [{c_a: [[], [1]]}, {c_b: [[0], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('9', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: graph,
  });
  const actual = [
    'a',
    'b',
    {
      name: 'c',
      graph: 'a:b',
    },
    {
      graph: 'c_a:c_b',
    },
  ];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'c',
      graph: [{c_a: [[], [1]]}, {c_b: [[0], []]}],
    },
    {
      graph: [{c_a: [[], [1]]}, {c_b: [[0], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('10', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: graph,
  });
  const actual = [
    'a',
    'b',
    {
      name: 'c',
      graph: 'a:b',
    },
    {
      graph: 'c_a:a',
    },
  ];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'c',
      graph: [{c_a: [[], [1]]}, {c_b: [[0], []]}],
    },
    {
      graph: [{c_a: [[], [1, 2]]}, {c_b: [[0], []]}, {a: [[0], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('11', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: graph,
  });
  const actual = [
    'a',
    'b',
    {
      name: 'c',
      graph: 'a:b',
    },
    {
      graph: 'a:c_b',
    },
  ];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'c',
      graph: [{c_a: [[], [1]]}, {c_b: [[0], []]}],
    },
    {
      graph: [{a: [[], [1]]}, {c_a: [[0], [2]]}, {c_b: [[1], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('12', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: graph,
  });
  const actual = [
    'a',
    'b',
    {
      name: 'c',
      graph: 'a:b',
    },
    {
      graph: 'c_a:a:c_b',
    },
  ];
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'b',
      graph: [{b: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'c',
      graph: [{c_a: [[], [1]]}, {c_b: [[0], []]}],
    },
    {
      graph: [
        {c_a: [[2], [1, 2]]}, // 0
        {c_b: [[0], []]}, // 1
        {a: [[0], [0]]}, // 2
      ],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});
