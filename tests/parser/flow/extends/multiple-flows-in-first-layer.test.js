import {assertEqualFlows, createFlows, createExpected} from '../../utils';

const flowsConfig = graph => ({
  splitters: {
    extends: '_',
  },
  flows: [
    {
      name: 'c',
      graph: ['a:b'],
      default_flow_name: 'b',
      extends_flows: [graph],
    },
  ],
});

test('1', () => {
  const actual = 'flow0';
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
      defaultNodeIndex: 1,
      graph: [{c_a: [[], [1]]}, {c_b: [[0], []]}],
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[], [1]]}, {flow0_c_b: [[0], []]}],
      extendedFlowIndex: 2,
      defaultNodeIndex: 1,
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('2', () => {
  const actual = 'flow0';
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
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[], [1]]}, {flow0_c_b: [[0], []]}],
      defaultNodeIndex: 1,
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
    flows: [
      {
        name: 'c',
        graph: ['a:b'],
        default_flow_name: 'b',
        extends_flows: [graph],
      },
    ],
  });

  const actual = 'flow0:flow1';
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
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[], [1]]}, {flow0_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'flow1',
      graph: [{flow1_c_a: [[], [1]]}, {flow1_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      graph: [
        {flow0_c_a: [[], [1]]}, // 0
        {flow0_c_b: [[0], [2]]}, // 1
        {flow1_c_a: [[1], [3]]}, // 2
        {flow1_c_b: [[2], []]}, // 3
      ],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('4', () => {
  const actual = 'flow0:flow1,flow2:flow3';
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
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[], [1]]}, {flow0_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'flow1',
      graph: [{flow1_c_a: [[], [1]]}, {flow1_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'flow2',
      graph: [{flow2_c_a: [[], [1]]}, {flow2_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'flow3',
      graph: [{flow3_c_a: [[], [1]]}, {flow3_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      graph: [
        {flow0_c_a: [[], [1]]}, // 0
        {flow0_c_b: [[0], [2, 4]]}, // 1
        {flow1_c_a: [[1], [3]]}, // 2
        {flow1_c_b: [[2], [6]]}, // 3
        {flow2_c_a: [[1], [5]]}, // 4
        {flow2_c_b: [[4], [6]]}, // 5
        {flow3_c_a: [[3, 5], [7]]}, // 6
        {flow3_c_b: [[6], []]}, // 7
      ],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('5', () => {
  const actual = 'flow0:flow1:flow0';
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
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[], [1]]}, {flow0_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'flow1',
      graph: [{flow1_c_a: [[], [1]]}, {flow1_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      graph: [
        {flow0_c_a: [[3], [1]]}, // 0
        {flow0_c_b: [[0], [2]]}, // 1
        {flow1_c_a: [[1], [3]]}, // 2
        {flow1_c_b: [[2], [0]]}, // 3
      ],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('6', () => {
  const actual = 'flow0:flow0';
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
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[], [1]]}, {flow0_c_b: [[0], []]}],
      defaultNodeIndex: 1,
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
    flows: [
      {
        name: 'c',
        graph: ['a:b:a'],
        default_flow_name: 'b',
        extends_flows: [graph],
      },
    ],
  });
  const actual = 'flow0';
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
      graph: [{c_a: [[1], [1]]}, {c_b: [[0], [0]]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[1], [1]]}, {flow0_c_b: [[0], [0]]}],
      defaultNodeIndex: 1,
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
    flows: [
      {
        name: 'c',
        graph: ['a:b'],
        default_flow_name: 'b',
        extends_flows: [graph],
      },
    ],
  });
  const actual = {
    name: 'composed-flow',
    graph: ['flow0_b'],
  };
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
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[], [1]]}, {flow0_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'composed-flow',
      graph: [
        {'composed-flow_flow0_c_a': [[], [1]]}, // 0
        {'composed-flow_flow0_c_b': [[0], []]}, // 1
      ],
      defaultNodeIndex: 1,
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
    flows: [
      {
        name: 'c',
        graph: ['a:b'],
        default_flow_name: 'b',
        extends_flows: [graph],
      },
    ],
  });
  const actual = {
    name: 'composed-flow',
    graph: ['flow0:flow1_b'],
  };
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
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[], [1]]}, {flow0_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'flow1',
      graph: [{flow1_c_a: [[], [1]]}, {flow1_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'composed-flow',
      graph: [
        {'composed-flow_flow0_c_a': [[], [1]]}, // 0
        {'composed-flow_flow0_c_b': [[0], [2]]}, // 1
        {'composed-flow_flow1_c_a': [[1], [3]]}, // 2
        {'composed-flow_flow1_c_b': [[2], []]}, // 3
      ],
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
    flows: [
      {
        name: 'c',
        graph: ['a:b'],
        default_flow_name: 'b',
        extends_flows: [graph],
      },
    ],
  });
  const actual = {
    name: 'composed-flow',
    graph: ['flow0_a:flow1'],
  };
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
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[], [1]]}, {flow0_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'flow1',
      graph: [{flow1_c_a: [[], [1]]}, {flow1_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'composed-flow',
      graph: [
        {'composed-flow_flow0_c_a': [[], [1, 2]]}, // 0
        {'composed-flow_flow0_c_b': [[0], []]}, // 1
        {'composed-flow_flow1_c_a': [[0], [3]]}, // 2
        {'composed-flow_flow1_c_b': [[2], []]}, // 3
      ],
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
    flows: [
      {
        name: 'c',
        graph: ['a:b'],
        default_flow_name: 'b',
        extends_flows: [graph],
      },
    ],
  });
  const actual = {
    name: 'composed-flow',
    graph: ['flow0_a:flow0_b'],
  };
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
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[], [1]]}, {flow0_c_b: [[0], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'composed-flow',
      graph: [{'composed-flow_flow0_c_a': [[], [1]]}, {'composed-flow_flow0_c_b': [[0], []]}],
      defaultNodeIndex: 1,
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
    flows: [
      {
        name: 'e',
        graph: ['a:b,c:d'],
        default_flow_name: 'b',
        extends_flows: [graph],
      },
    ],
  });
  const actual = {
    name: 'composed-flow',
    graph: ['flow0_a:flow0_d'],
  };
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
      graph: [{c: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'd',
      graph: [{d: [[], []]}],
      defaultNodeIndex: 0,
    },
    {
      name: 'e',
      graph: [{e_a: [[], [1, 2]]}, {e_b: [[0], [3]]}, {e_c: [[0], [3]]}, {e_d: [[1, 2], []]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [
        {flow0_e_a: [[], [1, 2]]},
        {flow0_e_b: [[0], [3]]},
        {flow0_e_c: [[0], [3]]},
        {flow0_e_d: [[1, 2], []]},
      ],
      defaultNodeIndex: 1,
      extendedFlowIndex: 4,
    },
    {
      name: 'composed-flow',
      graph: [
        {'composed-flow_flow0_e_a': [[], [1, 2, 3]]},
        {'composed-flow_flow0_e_b': [[0], [3]]},
        {'composed-flow_flow0_e_c': [[0], [3]]},
        {'composed-flow_flow0_e_d': [[0, 1, 2], []]},
      ],
      defaultNodeIndex: 1,
      extendedFlowIndex: 4,
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

// test('13', () => {
//   const splitters = {
//     extends: '_',
//     identifier: '/',
//   };
//   const flowsConfig = graph => ({
//     splitters,
//     flows: [
//       {
//         name: 'e',
//         graph: ['a:b,c:d'],
//         default_flow_name: 'b',
//         extends_flows: [graph],
//       },
//     ],
//   });
//   const actual = {
//     graph: ['flow0/i1:flow0/i2'],
//   };
//   const expected = [
//     {
//       name: 'a',
//       graph: [{a: [[], []]}],
//       defaultNodeIndex: 0,
//     },
//     {
//       name: 'b',
//       graph: [{b: [[], []]}],
//       defaultNodeIndex: 0,
//     },
//     {
//       name: 'c',
//       graph: [{c: [[], []]}],
//       defaultNodeIndex: 0,
//     },
//     {
//       name: 'd',
//       graph: [{d: [[], []]}],
//       defaultNodeIndex: 0,
//     },
//     {
//       graph: [{e_a: [[], [1, 2]]}, {e_b: [[0], [3]]}, {e_c: [[0], [3]]}, {e_d: [[1, 2], []]}],
//       defaultNodeIndex: 1,
//     },
//     {
//       name: 'flow0',
//       graph: [
//         {flow0_e_a: [[], [1, 2]]},
//         {flow0_e_b: [[0], [3]]},
//         {flow0_e_c: [[0], [3]]},
//         {flow0_e_d: [[1, 2], []]},
//       ],
//       defaultNodeIndex: 1,
//     },
//     {
//       graph: [
//         {'flow0_e_a/i1': [[], [1, 2]]}, // 0
//         {'flow0_e_b/i1': [[0], [3, 4]]}, // 1
//         {'flow0_e_c/i1': [[0], [3]]}, // 2
//         {'flow0_e_d/i1': [[1, 2], []]}, // 3
//         {'flow0_e_a/i2': [[1], [5, 6]]}, // 4
//         {'flow0_e_b/i2': [[4], [7]]}, // 5
//         {'flow0_e_c/i2': [[4], [7]]}, // 6
//         {'flow0_e_d/i2': [[5, 6], []]}, // 7
//       ],
//       defaultNodeIndex: 1,
//     },
//   ];
//
//   const actualFlows = createFlows(actual, flowsConfig);
//   const expectedFlows = createExpected(expected, flowsConfig(actual));
//
//   // assertEqualFlows(expectedFlows, actualFlows);
// });

test('14', () => {
  const flowsConfig = graph => ({
    splitters: {
      extends: '_',
    },
    flows: [
      {
        name: 'c',
        graph: ['a:b:a'],
        default_flow_name: 'b',
        extends_flows: [graph],
      },
    ],
  });
  const actual = 'flow0:flow1:flow0';
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
      graph: [{c_a: [[1], [1]]}, {c_b: [[0], [0]]}],
      defaultNodeIndex: 1,
    },
    {
      name: 'flow0',
      graph: [{flow0_c_a: [[1], [1]]}, {flow0_c_b: [[0], [0]]}],
      defaultNodeIndex: 1,
      extendedFlowIndex: 2,
    },
    {
      name: 'flow1',
      graph: [{flow1_c_a: [[1], [1]]}, {flow1_c_b: [[0], [0]]}],
      defaultNodeIndex: 1,
      extendedFlowIndex: 2,
    },
    {
      graph: [
        {flow0_c_a: [[1, 3], [1]]}, // 0
        {flow0_c_b: [[0], [0, 2]]}, // 1
        {flow1_c_a: [[1, 3], [3]]}, // 2
        {flow1_c_b: [[2], [2, 0]]}, // 3
      ],
      extendedFlowIndex: 2,
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig);
  const expectedFlows = createExpected(expected, flowsConfig(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});
