import { assertEqualFlows, createFlows, createExpected, ExpectedFlow } from '@test/utils/utils'
import { Configuration, UserFlow } from '@parser/types'

describe('multiple-flows-in-first-layer', () => {
  const flowsConfig = (graph: UserFlow): Required<Configuration<UserFlow>> => ({
    splitters: {
      extends: '_',
    },
    flows: [
      {
        name: 'c',
        graph: ['a:b'],
        default_path: 'b',
        extends_flows: [graph],
      },
    ],
  })

  it('1', () => {
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
        name: 'c',
        defaultNodeIndex: 1,
        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[], [1]] }, { flow0_c_b: [[0], []] }],
        extendedFlowIndex: 2,
        defaultNodeIndex: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('2', () => {
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
        name: 'c',
        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[], [1]] }, { flow0_c_b: [[0], []] }],
        defaultNodeIndex: 1,
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
      flows: [
        {
          name: 'c',
          graph: ['a:b'],
          default_path: 'b',
          extends_flows: [graph],
        },
      ],
    })

    const actual = 'flow0:flow1'
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
        name: 'c',
        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[], [1]] }, { flow0_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow1',
        graph: [{ flow1_c_a: [[], [1]] }, { flow1_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        graph: [
          { flow0_c_a: [[], [1]] }, // 0
          { flow0_c_b: [[0], [2]] }, // 1
          { flow1_c_a: [[1], [3]] }, // 2
          { flow1_c_b: [[2], []] }, // 3
        ],
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('4', () => {
    const actual = 'flow0:flow1,flow2:flow3'
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
        name: 'c',

        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[], [1]] }, { flow0_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow1',
        graph: [{ flow1_c_a: [[], [1]] }, { flow1_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow2',
        graph: [{ flow2_c_a: [[], [1]] }, { flow2_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow3',
        graph: [{ flow3_c_a: [[], [1]] }, { flow3_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        graph: [
          { flow0_c_a: [[], [1]] }, // 0
          { flow0_c_b: [[0], [2, 4]] }, // 1
          { flow1_c_a: [[1], [3]] }, // 2
          { flow1_c_b: [[2], [6]] }, // 3
          { flow2_c_a: [[1], [5]] }, // 4
          { flow2_c_b: [[4], [6]] }, // 5
          { flow3_c_a: [[3, 5], [7]] }, // 6
          { flow3_c_b: [[6], []] }, // 7
        ],
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('5', () => {
    const actual = 'flow0:flow1:flow0'
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
        name: 'c',
        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[], [1]] }, { flow0_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow1',
        graph: [{ flow1_c_a: [[], [1]] }, { flow1_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        graph: [
          { flow0_c_a: [[3], [1]] }, // 0
          { flow0_c_b: [[0], [2]] }, // 1
          { flow1_c_a: [[1], [3]] }, // 2
          { flow1_c_b: [[2], [0]] }, // 3
        ],
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('6', () => {
    const actual = 'flow0:flow0'
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
        name: 'c',

        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[], [1]] }, { flow0_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('7', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'c',
          graph: ['a:b:a'],
          default_path: 'b',
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
        name: 'c',
        graph: [{ c_a: [[1], [1]] }, { c_b: [[0], [0]] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[1], [1]] }, { flow0_c_b: [[0], [0]] }],
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
          name: 'c',
          graph: ['a:b'],
          default_path: 'b',
          extends_flows: [graph],
        },
      ],
    })
    const actual = {
      name: 'composed-flow',
      graph: ['flow0_b'],
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
        name: 'c',

        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[], [1]] }, { flow0_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'composed-flow',
        graph: [
          { 'composed-flow_flow0_c_a': [[], [1]] }, // 0
          { 'composed-flow_flow0_c_b': [[0], []] }, // 1
        ],
        defaultNodeIndex: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('9', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'c',
          graph: ['a:b'],
          default_path: 'b',
          extends_flows: [graph],
        },
      ],
    })
    const actual = {
      name: 'composed-flow',
      graph: ['flow0:flow1_b'],
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
        name: 'c',
        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[], [1]] }, { flow0_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow1',
        graph: [{ flow1_c_a: [[], [1]] }, { flow1_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'composed-flow',
        graph: [
          { 'composed-flow_flow0_c_a': [[], [1]] }, // 0
          { 'composed-flow_flow0_c_b': [[0], [2]] }, // 1
          { 'composed-flow_flow1_c_a': [[1], [3]] }, // 2
          { 'composed-flow_flow1_c_b': [[2], []] }, // 3
        ],
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
          name: 'c',
          graph: ['a:b'],
          default_path: 'b',
          extends_flows: [graph],
        },
      ],
    })
    const actual = {
      name: 'composed-flow',
      graph: ['flow0_a:flow1'],
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
        name: 'c',
        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[], [1]] }, { flow0_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow1',
        graph: [{ flow1_c_a: [[], [1]] }, { flow1_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'composed-flow',
        graph: [
          { 'composed-flow_flow0_c_a': [[], [1, 2]] }, // 0
          { 'composed-flow_flow0_c_b': [[0], []] }, // 1
          { 'composed-flow_flow1_c_a': [[0], [3]] }, // 2
          { 'composed-flow_flow1_c_b': [[2], []] }, // 3
        ],
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
          name: 'c',
          graph: ['a:b'],
          default_path: 'b',
          extends_flows: [graph],
        },
      ],
    })
    const actual = {
      name: 'composed-flow',
      graph: ['flow0_a:flow0_b'],
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
        name: 'c',
        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[], [1]] }, { flow0_c_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'composed-flow',
        graph: [{ 'composed-flow_flow0_c_a': [[], [1]] }, { 'composed-flow_flow0_c_b': [[0], []] }],
        defaultNodeIndex: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  // todo: need to fix this test. it failed after moving to ts.
  it('12', () => {
    const flowsConfig = (graph: UserFlow) => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'e',
          graph: ['a:b,c:d'],
          default_path: 'b',
          extends_flows: [graph],
        },
      ],
    })
    const actual = {
      name: 'composed-flow',
      graph: ['flow0_a:flow0_d'],
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
        name: 'c',
        graph: [{ c: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'd',
        graph: [{ d: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'e',
        graph: [{ e_a: [[], [1, 2]] }, { e_b: [[0], [3]] }, { e_c: [[0], [3]] }, { e_d: [[1, 2], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [
          { flow0_e_a: [[], [1, 2]] },
          { flow0_e_b: [[0], [3]] },
          { flow0_e_c: [[0], [3]] },
          { flow0_e_d: [[1, 2], []] },
        ],
        defaultNodeIndex: 1,
        extendedFlowIndex: 4,
      },
      {
        name: 'composed-flow',
        graph: [
          { 'composed-flow_flow0_e_a': [[], [1, 2, 3]] },
          { 'composed-flow_flow0_e_b': [[0], [3]] },
          { 'composed-flow_flow0_e_c': [[0], [3]] },
          { 'composed-flow_flow0_e_d': [[0, 1, 2], []] },
        ],
        defaultNodeIndex: 1,
        extendedFlowIndex: 4,
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
          name: 'c',
          graph: ['a:b:a'],
          default_path: 'b',
          extends_flows: [graph],
        },
      ],
    })
    const actual = 'flow0:flow1:flow0'
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
        name: 'c',
        graph: [{ c_a: [[1], [1]] }, { c_b: [[0], [0]] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow0',
        graph: [{ flow0_c_a: [[1], [1]] }, { flow0_c_b: [[0], [0]] }],
        defaultNodeIndex: 1,
        extendedFlowIndex: 2,
      },
      {
        name: 'flow1',
        graph: [{ flow1_c_a: [[1], [1]] }, { flow1_c_b: [[0], [0]] }],
        defaultNodeIndex: 1,
        extendedFlowIndex: 2,
      },
      {
        graph: [
          { flow0_c_a: [[1, 3], [1]] }, // 0
          { flow0_c_b: [[0], [0, 2]] }, // 1
          { flow1_c_a: [[1, 3], [3]] }, // 2
          { flow1_c_b: [[2], [2, 0]] }, // 3
        ],
        extendedFlowIndex: 2,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('14', () => {
    const flowsConfig = () => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'flow1',
          graph: 'a:b',
          default_path: 'b',
        },
        'flow2',
        {
          name: 'flow3',
          graph: 'flow1:flow2',
          default_path: 'flow1',
        },
      ],
    })
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
        name: 'flow1',
        graph: [{ flow1_a: [[], [1]] }, { flow1_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow2',
        graph: [{ flow2: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        graph: [
          { flow3_flow1_a: [[], [1]] }, // 0
          { flow3_flow1_b: [[0], [2]] }, // 1
          { flow3_flow2: [[1], []] }, // 2
        ],
        defaultNodeIndex: 1,
      },
    ]

    const actualFlows = createFlows(undefined, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig())

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('15', () => {
    const flowsConfig = () => ({
      splitters: {
        extends: '_',
      },
      flows: [
        {
          name: 'flow1',
          graph: 'a:b',
          default_path: 'b',
        },
        'flow2',
        {
          name: 'flow3',
          graph: 'flow1:flow2',
          default_path: 'flow1_b',
        },
      ],
    })
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
        name: 'flow1',
        graph: [{ flow1_a: [[], [1]] }, { flow1_b: [[0], []] }],
        defaultNodeIndex: 1,
      },
      {
        name: 'flow2',
        graph: [{ flow2: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        graph: [
          { flow3_flow1_a: [[], [1]] }, // 0
          { flow3_flow1_b: [[0], [2]] }, // 1
          { flow3_flow2: [[1], []] }, // 2
        ],
        defaultNodeIndex: 1,
      },
    ]

    const actualFlows = createFlows(undefined, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig())

    assertEqualFlows(expectedFlows, actualFlows)
  })
})
