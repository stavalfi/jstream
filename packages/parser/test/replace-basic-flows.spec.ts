import { assertEqualFlows, createFlows, createExpected, ExpectedFlow } from '@parser-test/utils/utils'
import { UserFlow } from '@parser/types'

describe('replace-basic-flows', () => {
  it('1', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
    const actual = ['a', 'b']
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('2', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
    const actual = ['a', 'b', 'a:b']
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        graph: [{ a: [[], [1]] }, { b: [[0], []] }],
        maxConcurrency: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('3', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
    const actual = ['a', 'b', 'a:b']
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        graph: [{ a: [[], [1]] }, { b: [[0], []] }],
        maxConcurrency: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('4', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
    const actual = ['a', 'b', 'b:a']
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        graph: [{ b: [[], [1]] }, { a: [[0], []] }],
        maxConcurrency: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('5', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
    const actual = ['a', 'b', 'a:b:a:b']
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        graph: [{ a: [[1], [1]] }, { b: [[0], [0]] }],
        maxConcurrency: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('6', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
    const actual = ['a', 'b', 'b:a', 'a:b:a:b']
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        graph: [{ b: [[], [1]] }, { a: [[0], []] }],
        maxConcurrency: 1,
      },
      {
        graph: [{ a: [[1], [1]] }, { b: [[0], [0]] }],
        maxConcurrency: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('7', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
    const actual = [
      'a',
      'b',
      {
        name: 'c',
        graph: 'a:b',
      },
      'c_a:c_b',
    ]
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        name: 'b',
        graph: [{ b: [[], []] }],
        defaultNodeIndex: 0,
        maxConcurrency: 1,
      },
      {
        name: 'c',
        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
        maxConcurrency: 1,
      },
      {
        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
        maxConcurrency: 1,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('8', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
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
    ]
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
      },
      {
        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('9', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
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
    ]
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
      },
      {
        graph: [{ c_a: [[], [1]] }, { c_b: [[0], []] }],
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('10', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
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
    ]
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
      },
      {
        graph: [{ c_a: [[], [1, 2]] }, { c_b: [[0], []] }, { a: [[0], []] }],
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('11', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
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
    ]
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
      },
      {
        graph: [{ a: [[], [1]] }, { c_a: [[0], [2]] }, { c_b: [[1], []] }],
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('12', () => {
    const flowsConfig = (graph: UserFlow[]) => ({
      splitters: {
        extends: '_',
      },
      flows: graph,
    })
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
    ]
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
      },
      {
        graph: [
          { c_a: [[], [1, 2]] }, // 0
          { c_b: [[0], []] }, // 1
          { a: [[0], [3]] }, // 2
          { c_a: [[2], [4]] }, // 3
          { c_b: [[3], []] }, // 4
        ],
        pathsGroups: [['1', '2', '3'], ['1', '2', '4'], ['1', '5'], ['1', '6', '7'], ['1', '6', '8']],
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig)
    const expectedFlows = createExpected(expected, flowsConfig(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })
})
