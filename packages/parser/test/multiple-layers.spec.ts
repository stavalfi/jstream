import { assertEqualFlows, createFlows, createExpected, ExpectedFlow } from 'utils/utils'
import { UserFlow } from 'types'

describe('multiple-layers', () => {
  it('1', () => {
    const flowsConfig = (graph: UserFlow) => ({
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
    })
    const actual = 'flow0'
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'b',
        graph: [{ b_a: [[], []] }],
        extendedFlowIndex: 0,
        defaultNodeIndex: 0,
      },
      {
        name: 'c',
        graph: [{ c_b_a: [[], []] }],
        extendedFlowIndex: 1,
        defaultNodeIndex: 0,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_b_a: [[], []] }],
        extendedFlowIndex: 2,
        defaultNodeIndex: 0,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('2', () => {
    const flowsConfig = (graph: UserFlow) => ({
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
    })
    const actual = 'flow0:flow1:flow0:flow1:flow0:flow0:flow1:flow1'
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'b',
        graph: [{ b_a: [[], []] }],
        defaultNodeIndex: 0,
        extendedFlowIndex: 0,
      },
      {
        name: 'c',
        graph: [{ c_b_a: [[], []] }],
        defaultNodeIndex: 0,
        extendedFlowIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_b_a: [[], []] }],
        defaultNodeIndex: 0,
        extendedFlowIndex: 2,
      },
      {
        name: 'flow1',
        graph: [{ flow1_c_b_a: [[], []] }],
        defaultNodeIndex: 0,
        extendedFlowIndex: 2,
      },
      {
        graph: [{ flow0_c_b_a: [[1], [1]] }, { flow1_c_b_a: [[0], [0]] }],
        extendedFlowIndex: 2,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('3', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: ['a', graph],
    })

    const actual = {
      name: 'flow1',
      graph: 'a',
    }
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow1',
        graph: [{ flow1_a: [[], []] }],
        defaultNodeIndex: 0,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('4', () => {
    const flowsConfig = (graph: UserFlow) => ({
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
    })

    const actual = 'b'
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow1',
        graph: [{ flow1_a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'b',
        graph: [{ b_flow1_a: [[], []] }],
        defaultNodeIndex: 0,
        extendedFlowIndex: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('5', () => {
    const flowsConfig = (graph: UserFlow) => ({
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
    })
    const actual = {
      name: 'composed-flow',
      graph: ['flow1:flow2'],
      default_flow_name: 'flow2',
    }
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'b',
        graph: [{ b_a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow1',
        graph: [{ flow1_b_a: [[], []] }],
        defaultNodeIndex: 0,
        extendedFlowIndex: 1,
      },
      {
        name: 'flow2',
        graph: [{ flow2_b_a: [[], []] }],
        defaultNodeIndex: 0,
        extendedFlowIndex: 1,
      },
      {
        name: 'composed-flow',
        defaultNodeIndex: 1,
        graph: [{ 'composed-flow_flow1_b_a': [[], [1]] }, { 'composed-flow_flow2_b_a': [[0], []] }],
        extendedFlowIndex: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('6', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          graph: 'a',
          extends_flows: ['flow1', graph],
        },
      ],
    })
    const actual = {
      name: 'flow2',
      graph: 'flow1',
    }
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow1',
        graph: [{ flow1_a: [[], []] }],
        defaultNodeIndex: 0,
        extendedFlowIndex: 0,
      },
      {
        name: 'flow2',
        graph: [{ flow2_flow1_a: [[], []] }],
        defaultNodeIndex: 0,
        extendedFlowIndex: 0,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  // bug
  it('7', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'flow0',
          graph: 'a:b',
          default_flow_name: 'b',
          extends_flows: ['flow1', graph],
        },
      ],
    })
    const actual = {
      name: 'flow2',
      graph: 'flow1',
    }
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow0',
        defaultNodeIndex: 1,
        graph: [{ flow0_a: [[], [1]] }, { flow0_b: [[0], []] }],
      },
      {
        name: 'flow1',
        graph: [{ flow1_flow0_a: [[], [1]] }, { flow1_flow0_b: [[0], []] }],
        extendedFlowIndex: 2,
        defaultNodeIndex: 1,
      },
      {
        name: 'flow2',
        graph: [{ flow2_flow1_flow0_a: [[], [1]] }, { flow2_flow1_flow0_b: [[0], []] }],
        extendedFlowIndex: 2,
        defaultNodeIndex: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('8', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          graph: 'flow0',
          extends_flows: [
            {
              name: 'flow1',
              graph: 'a:b',
              default_flow_name: 'b',
            },
            {
              name: 'flow2',
              graph: 'c:d',
              default_flow_name: 'd',
            },
            graph,
          ],
        },
      ],
    })
    const actual = {
      name: 'composed-flow',
      graph: 'flow1:flow2',
    }
    const expected: ExpectedFlow[] = [
      {
        name: 'flow0',
        graph: [{ flow0: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'a',
        graph: [{ a_flow0: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'b',
        graph: [{ b_flow0: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow1',
        graph: [{ flow1_a_flow0: [[], [1]] }, { flow1_b_flow0: [[0], []] }],
        extendedFlowIndex: 0,
        defaultNodeIndex: 1,
      },
      {
        name: 'c',
        graph: [{ c_flow0: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'd',
        graph: [{ d_flow0: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow2',
        graph: [{ flow2_c_flow0: [[], [1]] }, { flow2_d_flow0: [[0], []] }],
        extendedFlowIndex: 0,
        defaultNodeIndex: 1,
      },
      {
        name: 'composed-flow',
        graph: [
          { 'composed-flow_flow1_a_flow0': [[], [1]] },
          { 'composed-flow_flow1_b_flow0': [[0], [2]] },
          { 'composed-flow_flow2_c_flow0': [[1], [3]] },
          { 'composed-flow_flow2_d_flow0': [[2], []] },
        ],
        extendedFlowIndex: 0,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  // this it is an example for why we must specify the name of the extended-flow if we
  // extends it because if not, in this example, we can't know if flow0 extends a:b or not.
  // it('it-for-notes', () => {
  //   const flowsConfig = graph => ({
  //     splitters: {
  //       extends: '_',
  //     },
  //     flows: [
  //       {
  //         graph: 'a:b',
  //         extends_flows: [graph],
  //       },
  //     ],
  //   });
  //   const actual = 'flow0';
  //   const expected: ExpectedFlow[] = [
  //     {
  //       name: 'a',
  //       graph: [{a: [[], []]}],
  //     },
  //     {
  //       name: 'b',
  //       graph: [{b: [[], []]}],
  //     },
  //     {
  //       graph: [{a: [[], [1]]}, {b: [[0], []]}],
  //     },
  //     {
  //       name: 'flow0',
  //       graph: [{flow0_a: [[], [1]]}, {flow0_b: [[0], []]}],
  //       extendedFlowIndex: 0,
  //     },
  //   ];
  //
  //   const actualFlows = createFlows(actual, flowsConfig);
  //   const expectedFlows = createExpected(expected, flowsConfig(actual));
  //
  //   assertEqualFlows(expectedFlows, actualFlows);
  // });

  it('9', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'composed-flow',
          graph: 'a:b',
          default_flow_name: 'b',
          extends_flows: [graph],
        },
      ],
    })
    const actual = 'flow0'
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'composed-flow',
        graph: [{ 'composed-flow_a': [[], [1]] }, { 'composed-flow_b': [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ 'flow0_composed-flow_a': [[], [1]] }, { 'flow0_composed-flow_b': [[0], []] }],
        extendedFlowIndex: 2,
        defaultNodeIndex: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('10', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'flow0',
          graph: 'a:b',
          default_flow_name: 'b',
        },
        {
          name: 'composed-flow',
          graph: 'flow1:flow2',
          default_flow_name: 'flow1',
          extends_flows: [graph],
        },
      ],
    })
    const actual = 'flow0'
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow0',
        graph: [{ flow0_a: [[], [1]] }, { flow0_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow1',
        graph: [{ flow1: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow2',
        graph: [{ flow2: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'composed-flow',
        graph: [{ 'composed-flow_flow1': [[], [1]] }, { 'composed-flow_flow2': [[0], []] }],
        defaultNodeIndex: 0,
      },
      {
        graph: [
          { 'flow0_a_composed-flow_flow1': [[], [1, 2]] },
          { 'flow0_a_composed-flow_flow2': [[0], []] },
          { 'flow0_b_composed-flow_flow1': [[0], [3]] },
          { 'flow0_b_composed-flow_flow2': [[2], []] },
        ],
        defaultNodeIndex: 2,
        extendedFlowIndex: 5,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('11', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'flow0',
          graph: 'a:b',
          default_flow_name: 'b',
        },
        {
          name: 'composed-flow',
          graph: 'flow1:flow2',
          default_flow_name: 'flow1',
          extends_flows: [graph],
        },
      ],
    })
    const actual =
      'flow0_a_composed-flow_flow1:flow0_a_composed-flow_flow2,[flow0_b_composed-flow_flow1:flow0_b_composed-flow_flow2]'
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow0',
        graph: [{ flow0_a: [[], [1]] }, { flow0_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow1',
        graph: [{ flow1: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow2',
        graph: [{ flow2: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'composed-flow',
        graph: [{ 'composed-flow_flow1': [[], [1]] }, { 'composed-flow_flow2': [[0], []] }],
        defaultNodeIndex: 0,
      },
      {
        graph: [
          { 'flow0_a_composed-flow_flow1': [[], [1, 2]] },
          { 'flow0_a_composed-flow_flow2': [[0], []] },
          { 'flow0_b_composed-flow_flow1': [[0], [3]] },
          { 'flow0_b_composed-flow_flow2': [[2], []] },
        ],
        defaultNodeIndex: 2,
        extendedFlowIndex: 5,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('12', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'flow0',
          graph: 'a:b',
          default_flow_name: 'b',
        },
        {
          name: 'flow1',
          graph: 'a:b',
          default_flow_name: 'a',
        },
        graph,
      ],
    })
    const actual = {
      name: 'composed-flow',
      graph: 'flow0:flow1',
    }
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow0',
        graph: [{ flow0_a: [[], [1]] }, { flow0_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow1',
        graph: [{ flow1_a: [[], [1]] }, { flow1_b: [[0], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'composed-flow',
        graph: [
          { 'composed-flow_flow0_a': [[], [1]] }, // 0
          { 'composed-flow_flow0_b': [[0], [2]] }, // 1
          { 'composed-flow_flow1_a': [[1], [3]] }, // 2
          { 'composed-flow_flow1_b': [[2], []] }, // 3
        ],
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('13', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'flow0',
          graph: 'a:b',
          default_flow_name: 'b',
        },
        {
          name: 'flow1',
          graph: 'a:b',
          default_flow_name: 'a',
        },
        graph,
      ],
    })
    const actual = {
      name: 'composed-flow',
      graph: 'flow0_a:flow1',
    }
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow0',
        graph: [{ flow0_a: [[], [1]] }, { flow0_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow1',
        graph: [{ flow1_a: [[], [1]] }, { flow1_b: [[0], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'composed-flow',
        graph: [
          { 'composed-flow_flow0_a': [[], [1, 2]] }, // 0
          { 'composed-flow_flow0_b': [[0], []] }, // 1
          { 'composed-flow_flow1_a': [[0], [3]] }, // 2
          { 'composed-flow_flow1_b': [[2], []] }, // 3
        ],
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('14', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'f',
          graph: 'start:complete',
          default_flow_name: 'complete',
          extends_flows: [
            {
              name: 'flow0',
              graph: 'a:b',
              default_flow_name: 'b',
            },
            {
              name: 'flow1',
              graph: 'a:b',
              default_flow_name: 'a',
            },
            graph,
          ],
        },
      ],
    })
    const actual = {
      name: 'composedflow',
      graph: 'flow0_a:flow1',
    }
    const expected: ExpectedFlow[] = [
      {
        name: 'start',
        graph: [{ start: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'complete',
        graph: [{ complete: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'f',
        graph: [{ f_start: [[], [1]] }, { f_complete: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'a',
        graph: [{ a_f_start: [[], [1]] }, { a_f_complete: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'b',
        graph: [{ b_f_start: [[], [1]] }, { b_f_complete: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [
          { flow0_a_f_start: [[], [1]] },
          { flow0_a_f_complete: [[0], [2]] },
          { flow0_b_f_start: [[1], [3]] },
          { flow0_b_f_complete: [[2], []] },
        ],
        defaultNodeIndex: 3,
      },
      {
        name: 'flow1',
        graph: [
          { flow1_a_f_start: [[], [1]] },
          { flow1_a_f_complete: [[0], [2]] },
          { flow1_b_f_start: [[1], [3]] },
          { flow1_b_f_complete: [[2], []] },
        ],
        defaultNodeIndex: 1,
      },
      {
        name: 'composedflow',
        graph: [
          { composedflow_flow0_a_f_start: [[], [1]] }, // 0
          { composedflow_flow0_a_f_complete: [[0], [2, 4]] }, // 1
          { composedflow_flow0_b_f_start: [[1], [3]] }, // 2
          { composedflow_flow0_b_f_complete: [[2], []] }, // 3

          { composedflow_flow1_a_f_start: [[1], [5]] }, // 4
          { composedflow_flow1_a_f_complete: [[4], [6]] }, // 5
          { composedflow_flow1_b_f_start: [[5], [7]] }, // 6
          { composedflow_flow1_b_f_complete: [[6], []] }, // 7
        ],
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })
})
