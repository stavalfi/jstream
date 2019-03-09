import '../';
import {flattenUserFlowShortcuts} from '../../src/parser/user-shortcuts-parser';

const splitters = {
  extends: '_',
  identifier: '/',
};

test('1', () => {
  const actual = 'flow0';
  const expectedUserFlows = [
    {
      name: 'flow0',
      graph: ['flow0'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('2', () => {
  const actual = ['flow0'];
  const expectedUserFlows = [
    {
      name: 'flow0',
      graph: ['flow0'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('3', () => {
  const actual = 'flow0:flow1';
  const expectedUserFlows = [
    {
      graph: ['flow0:flow1'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('4', () => {
  const actual = ['flow0:flow1'];
  const expectedUserFlows = [
    {
      graph: ['flow0:flow1'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('5', () => {
  const actual = 'flow0:flow1:flow1';
  const expectedUserFlows = [
    {
      graph: ['flow0:flow1:flow1'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('6', () => {
  const actual = ['flow0:flow1:flow1'];
  const expectedUserFlows = [
    {
      graph: ['flow0:flow1:flow1'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('7', () => {
  const actual = 'flow0:flow1:flow2';
  const expectedUserFlows = [
    {
      graph: ['flow0:flow1:flow2'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('8', () => {
  const actual = ['flow0:flow1:flow2'];
  const expectedUserFlows = [
    {
      graph: ['flow0:flow1:flow2'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('9', () => {
  const actual = {
    graph: 'flow0',
    extends_flows: [],
  };
  const expectedUserFlows = [
    {
      name: 'flow0',
      graph: ['flow0'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('10', () => {
  const actual = {
    graph: ['flow0'],
    extends_flows: [],
  };
  const expectedUserFlows = [
    {
      name: 'flow0',
      graph: ['flow0'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('11', () => {
  const actual = {
    graph: 'flow0:flow1:flow2',
  };
  const expectedUserFlows = [
    {
      graph: ['flow0:flow1:flow2'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('12', () => {
  const actual = {
    graph: ['flow0:flow1:flow2'],
    extends_flows: [],
  };
  const expectedUserFlows = [
    {
      graph: ['flow0:flow1:flow2'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('12', () => {
  const actual = {
    graph: ['flow0:flow1:flow2'],
  };
  const expectedUserFlows = [
    {
      graph: ['flow0:flow1:flow2'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('13', () => {
  const actual = {
    name: 'flow0',
    graph: ['flow0'],
  };
  const expectedUserFlows = [
    {
      name: 'flow0',
      graph: ['flow0'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('14', () => {
  const actual = {
    name: 'flow1',
    graph: ['flow0'],
  };
  const expectedUserFlows = [
    {
      name: 'flow1',
      graph: ['flow0'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('15', () => {
  const actual = {
    name: 'flow1',
    graph: ['flow0/id1'],
  };
  const expectedUserFlows = [
    {
      name: 'flow1',
      graph: ['flow0/id1'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('16', () => {
  const actual = {
    graph: ['flow0/id1'],
  };
  const expectedUserFlows = [
    {
      graph: ['flow0/id1'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('17', () => {
  const actual = 'a_b:a_c';
  const expectedUserFlows = [
    {
      name: 'a',
      graph: ['a_b:a_c'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)([])(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('18', () => {
  const parsedFlows = [
    {
      name: 'a',
      graph: [
        {
          path: 'a',
          flowId: '1',
          children: [],
          parents: [],
        },
      ],
    },
  ];
  const actual = 'a';
  const expectedUserFlows = [
    {
      graph: ['a'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)(parsedFlows)(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('19', () => {
  const parsedFlows = [
    {
      name: 'a',
      graph: [
        {
          path: 'a',
          flowId: '1',
          children: [],
          parents: [],
        },
      ],
    },
  ];
  const actual = 'flow1_a';
  const expectedUserFlows = [
    {
      name: 'flow1',
      graph: ['flow1_a'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)(parsedFlows)(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});

test('20', () => {
  const parsedFlows = [
    {
      name: 'a',
      graph: [
        {
          path: 'a',
          flowId: '1',
          children: [],
          parents: [],
        },
      ],
    },
  ];
  const actual = 'flow1_a:flow1';
  const expectedUserFlows = [
    {
      name: 'flow1',
      graph: ['flow1_a:flow1'],
      extendsFlows: [],
    },
  ];

  const actualUserFlows = flattenUserFlowShortcuts(splitters)(parsedFlows)(actual);
  expect(actualUserFlows).toEqual(expectedUserFlows);
});
