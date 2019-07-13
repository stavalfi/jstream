import { assertEqualFlows, createFlows, createExpected, ExpectedFlow } from '@parser-test/utils/utils'
import { Splitters, UserFlow } from '@parser/types'

describe('flow-spliterators', () => {
  const flowsConfig = (splitters: Splitters) => (graph: UserFlow) => ({
    splitters,
    flows: [
      {
        graph: ['a'],
        extends_flows: [graph],
      },
    ],
  })

  it('1', () => {
    const splitters = {
      extends: '/',
    }
    const actual = 'flow0'
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow0',
        graph: [{ [`flow0${splitters.extends}a`]: [[], []] }],
        defaultNodeIndex: 0,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig(splitters))
    const expectedFlows = createExpected(expected, flowsConfig(splitters)(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('2', () => {
    const splitters = {
      extends: '___',
    }
    const actual = 'flow0'
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow0',
        graph: [{ [`flow0${splitters.extends}a`]: [[], []] }],
        defaultNodeIndex: 0,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig(splitters))
    const expectedFlows = createExpected(expected, flowsConfig(splitters)(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('3', () => {
    const splitters = {
      extends: '//',
    }
    const actual = 'flow0'
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow0',
        graph: [{ [`flow0${splitters.extends}a`]: [[], []] }],
        defaultNodeIndex: 0,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig(splitters))
    const expectedFlows = createExpected(expected, flowsConfig(splitters)(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })

  it('4', () => {
    const splitters = {
      extends: '_flow0_',
    }
    const actual = 'flow0'
    const expected: ExpectedFlow[] = [
      {
        name: 'a',
        graph: [{ a: [[], []] }],
        defaultNodeIndex: 0,
      },
      {
        name: 'flow0',
        graph: [{ [`flow0${splitters.extends}a`]: [[], []] }],
        defaultNodeIndex: 0,
      },
    ]

    const actualFlows = createFlows(actual, flowsConfig(splitters))
    const expectedFlows = createExpected(expected, flowsConfig(splitters)(actual))

    assertEqualFlows(expectedFlows, actualFlows)
  })
})
