import parse from '@parser/index'

describe('extension properties injection', () => {
  it('1 - no extensions', () => {
    const config1 = parse('a')
    expect(Object.keys(config1.flows[0])).toHaveLength(6)

    const config2 = parse<{}>('a')
    expect(Object.keys(config2.flows[0])).toHaveLength(6)

    const config3 = parse<{}, {}>('a')
    expect(Object.keys(config3.flows[0])).toHaveLength(6)
  })
  it('2 - no extensions', () => {
    const config1 = parse({
      graph: 'a',
    })
    expect(Object.keys(config1.flows[0])).toHaveLength(6)

    const config2 = parse<{}>({
      graph: 'a',
    })
    expect(Object.keys(config2.flows[0])).toHaveLength(6)

    const config3 = parse<{}, {}>({
      graph: 'a',
    })
    expect(Object.keys(config3.flows[0])).toHaveLength(6)
  })
  it('3 - no extension but with a custom ext-parser', () => {
    const config1 = parse<{}>('a', () => ({}))
    expect(Object.keys(config1.flows[0])).toHaveLength(6)

    const config2 = parse<{}, {}>('a', () => ({ a: 1 }))
    expect(Object.keys(config2.flows[0])).toHaveLength(7)

    const config3 = parse<{}, {}>(
      {
        graph: 'a',
      },
      () => ({ a: 1 }),
    )
    expect(Object.keys(config3.flows[0])).toHaveLength(7)
  })

  it('4 - with one unparsed-extension property and no extension properties', () => {
    const config1 = parse<{ a: 1 }>('a', () => ({}))
    expect(Object.keys(config1.flows[0])).toHaveLength(6)

    const config2 = parse<{ a: 1 }>(
      {
        a: 1,
        graph: 'b',
      },
      () => ({}),
    )
    expect(Object.keys(config2.flows[0])).toHaveLength(6)

    const config3 = parse<{ a: 1 }>(
      [
        {
          a: 1,
          graph: 'b',
        },
      ],
      () => ({}),
    )
    expect(Object.keys(config3.flows[0])).toHaveLength(6)

    const config4 = parse<{ a: 1 }>(
      {
        flows: [
          {
            a: 1,
            graph: 'b',
          },
        ],
      },
      () => ({}),
    )
    expect(Object.keys(config4.flows[0])).toHaveLength(6)
  })

  it('5 - with one unparsed-extension property and one extension properties', () => {
    const config1 = parse('a', () => ({ b: 2 }))
    expect(Object.keys(config1.flows[0])).toHaveLength(7)
    expect(config1.flows[0]).toHaveProperty('b')
    expect(config1.flows[0].b).toEqual(2)

    const config2 = parse<{ a: number }, { b: string }>(
      {
        a: 1,
        graph: 'b',
      },
      () => ({ b: 'str1' }),
    )
    expect(Object.keys(config2.flows[0])).toHaveLength(7)
    expect(config2.flows[0]).toHaveProperty('b')
    expect(config2.flows[0].b).toEqual('str1')

    const config3 = parse<{ a: number }, { b: string }>(
      {
        a: 1,
        graph: 'b',
      },
      ({ extProps }) => ('a' in extProps && extProps.a === 1 ? { b: 'str1' } : { b: 'bug!' }),
    )
    expect(Object.keys(config3.flows[0])).toHaveLength(7)
    expect(config3.flows[0]).toHaveProperty('b')
    expect(config3.flows[0].b).toEqual('str1')
  })

  it('6 - with one unparsed-extension property and multiple extension properties', () => {
    const config1 = parse('a', () => ({ b: 2, c: 3 }))
    expect(Object.keys(config1.flows[0])).toHaveLength(8)
    expect(config1.flows[0]).toHaveProperty('b')
    expect(config1.flows[0].b).toEqual(2)
    expect(config1.flows[0]).toHaveProperty('c')
    expect(config1.flows[0].c).toEqual(3)

    const config2 = parse<{ a: number }, { b: string; c: string; d: boolean }>(
      {
        a: 1,
        graph: 'b',
      },
      () => ({ b: 'str1', c: 'cccc', d: true }),
    )
    expect(Object.keys(config2.flows[0])).toHaveLength(9)
    expect(config2.flows[0]).toHaveProperty('b')
    expect(config2.flows[0].b).toEqual('str1')
    expect(config2.flows[0]).toHaveProperty('c')
    expect(config2.flows[0].c).toEqual('cccc')
    expect(config2.flows[0]).toHaveProperty('d')
    expect(config2.flows[0].d).toBe(true)

    const config3 = parse<{ a: number }, { b: string; c: string; d: boolean }>(
      {
        a: 1,
        graph: 'b',
      },
      ({ extProps: props }) =>
        'a' in props && props.a === 1 ? { b: 'str1', c: 'cccc', d: true } : { b: 'bug!', c: 'bugg', d: false },
    )
    expect(Object.keys(config3.flows[0])).toHaveLength(9)
    expect(config3.flows[0]).toHaveProperty('b')
    expect(config3.flows[0].b).toEqual('str1')
    expect(config3.flows[0]).toHaveProperty('c')
    expect(config3.flows[0].c).toEqual('cccc')
    expect(config3.flows[0]).toHaveProperty('d')
    expect(config3.flows[0].d).toBe(true)
  })

  it('7 - with multiple unparsed-extension property and multiple extension properties', () => {
    const config1 = parse('a', () => ({ b: 2, c: 3 }))
    expect(Object.keys(config1.flows[0])).toHaveLength(8)
    expect(config1.flows[0]).toHaveProperty('b')
    expect(config1.flows[0].b).toEqual(2)
    expect(config1.flows[0]).toHaveProperty('c')
    expect(config1.flows[0].c).toEqual(3)

    const config2 = parse<{ a: number; b: string }, { b: string; c: string; d: boolean }>(
      {
        a: 1,
        b: 'a',
        graph: 'b',
      },
      () => ({ b: 'str1', c: 'cccc', d: true }),
    )
    expect(Object.keys(config2.flows[0])).toHaveLength(9)
    expect(config2.flows[0]).toHaveProperty('b')
    expect(config2.flows[0].b).toEqual('str1')
    expect(config2.flows[0]).toHaveProperty('c')
    expect(config2.flows[0].c).toEqual('cccc')
    expect(config2.flows[0]).toHaveProperty('d')
    expect(config2.flows[0].d).toBe(true)

    const config3 = parse<{ a: number; b: string }, { b: string; c: string; d: boolean }>(
      {
        a: 1,
        b: 'a',
        graph: 'b',
      },
      ({ extProps: props }) =>
        'a' in props && props.a === 1 && 'b' in props && props.b === 'a'
          ? { b: 'str1', c: 'cccc', d: true }
          : { b: 'bug!', c: 'bugg', d: false },
    )
    expect(Object.keys(config3.flows[0])).toHaveLength(9)
    expect(config3.flows[0]).toHaveProperty('b')
    expect(config3.flows[0].b).toEqual('str1')
    expect(config3.flows[0]).toHaveProperty('c')
    expect(config3.flows[0].c).toEqual('cccc')
    expect(config3.flows[0]).toHaveProperty('d')
    expect(config3.flows[0].d).toBe(true)
  })

  it('8 - failing to overrirde parser properties from extension properties', () => {
    expect(() =>
      parse(
        {
          graph: 'a',
          a: '1',
          extendsFlows: 5,
          hasPredefinedName: 7,
        },
        () => ({ b: 2, c: 3, extendsFlows: 8, default_path: 9, hasPredefinedName: 10 }),
      ),
    ).toThrow('overriding parser properties is not allowed')
  })
})
