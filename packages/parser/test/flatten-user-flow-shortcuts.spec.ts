import { flattenUserFlowShortcuts } from '@parser/user-shortcuts-parser'
import { ParsedFlow } from '@parser/types'

describe('flatten-user-flow-shortcuts', () => {
  const splitters = {
    extends: '_',
    identifier: '/',
  }

  it('1', () => {
    const actual = 'flow0'
    const expectedUserFlows = [
      {
        name: 'flow0',
        graph: ['flow0'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('2', () => {
    const actual = ['flow0']
    const expectedUserFlows = [
      {
        name: 'flow0',
        graph: ['flow0'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('3', () => {
    const actual = 'flow0:flow1'
    const expectedUserFlows = [
      {
        graph: ['flow0:flow1'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('4', () => {
    const actual = ['flow0:flow1']
    const expectedUserFlows = [
      {
        graph: ['flow0:flow1'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('5', () => {
    const actual = 'flow0:flow1:flow1'
    const expectedUserFlows = [
      {
        graph: ['flow0:flow1:flow1'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('6', () => {
    const actual = ['flow0:flow1:flow1']
    const expectedUserFlows = [
      {
        graph: ['flow0:flow1:flow1'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('7', () => {
    const actual = 'flow0:flow1:flow2'
    const expectedUserFlows = [
      {
        graph: ['flow0:flow1:flow2'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('8', () => {
    const actual = ['flow0:flow1:flow2']
    const expectedUserFlows = [
      {
        graph: ['flow0:flow1:flow2'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('9', () => {
    const actual = {
      graph: 'flow0',
      extends_flows: [],
    }
    const expectedUserFlows = [
      {
        name: 'flow0',
        graph: ['flow0'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('10', () => {
    const actual = {
      graph: ['flow0'],
      extends_flows: [],
    }
    const expectedUserFlows = [
      {
        name: 'flow0',
        graph: ['flow0'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('11', () => {
    const actual = {
      graph: 'flow0:flow1:flow2',
    }
    const expectedUserFlows = [
      {
        graph: ['flow0:flow1:flow2'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('12', () => {
    const actual = {
      graph: ['flow0:flow1:flow2'],
      extends_flows: [],
    }
    const expectedUserFlows = [
      {
        graph: ['flow0:flow1:flow2'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('13', () => {
    const actual = {
      graph: ['flow0:flow1:flow2'],
    }
    const expectedUserFlows = [
      {
        graph: ['flow0:flow1:flow2'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('14', () => {
    const actual = {
      name: 'flow0',
      graph: ['flow0'],
    }
    const expectedUserFlows = [
      {
        name: 'flow0',
        graph: ['flow0'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('15', () => {
    const actual = {
      name: 'flow1',
      graph: ['flow0'],
      rules: [],
      side_effects: [],
    }
    const expectedUserFlows = [
      {
        name: 'flow1',
        graph: ['flow0'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('16', () => {
    const actual = {
      name: 'flow1',
      graph: ['flow0/id1'],
    }
    const expectedUserFlows = [
      {
        name: 'flow1',
        graph: ['flow0/id1'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('17', () => {
    const actual = {
      graph: ['flow0/id1'],
    }
    const expectedUserFlows = [
      {
        graph: ['flow0/id1'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('18', () => {
    const actual = 'a_b:a_c'
    const expectedUserFlows = [
      {
        name: 'a',
        graph: ['a_b:a_c'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('19', () => {
    const parsedFlows: ParsedFlow[] = [
      {
        name: 'a',
        graph: [
          {
            path: ['a'],
            childrenIndexes: [],
            parentsIndexes: [],
          },
        ],
        id: '1',
        maxConcurrency: 1,
        rules: [],
        sideEffects: [],
      },
    ]
    const actual = 'a'
    const expectedUserFlows = [
      {
        graph: ['a'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)(parsedFlows)(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('20', () => {
    const parsedFlows = [
      {
        name: 'a',
        graph: [
          {
            path: ['a'],
            childrenIndexes: [],
            parentsIndexes: [],
          },
        ],
        id: '1',
        sideEffects: [],
        rules: [],
        maxConcurrency: 1,
      },
    ]
    const actual = 'flow1_a'
    const expectedUserFlows = [
      {
        name: 'flow1',
        graph: ['flow1_a'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)(parsedFlows)(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })

  it('21', () => {
    const parsedFlows = [
      {
        name: 'a',
        graph: [
          {
            path: ['a'],
            childrenIndexes: [],
            parentsIndexes: [],
          },
        ],
        id: '1',
        sideEffects: [],
        rules: [],
        maxConcurrency: 1,
      },
    ]
    const actual = 'flow1_a:flow1'
    const expectedUserFlows = [
      {
        name: 'flow1',
        graph: ['flow1_a:flow1'],
        extendsFlows: [],
        maxConcurrency: 1,
        rules: [],
        side_effects: [],
      },
    ]

    const actualUserFlows = flattenUserFlowShortcuts(splitters)(parsedFlows)(actual)
    expect(actualUserFlows).toEqual(expectedUserFlows)
  })
})
