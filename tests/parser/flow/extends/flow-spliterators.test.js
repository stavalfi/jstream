import {assertEqualFlows, createFlows, createExpected} from '../../utils';

const flowsConfig = splitters => graph => ({
  splitters,
  flows: [
    {
      graph: ['a'],
      extends_flows: [graph],
    },
  ],
});

test('1', () => {
  const splitters = {
    extends: '/',
  };
  const actual = 'flow0';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow0',
      graph: [{[`flow0${splitters.extends}a`]: [[], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig(splitters));
  const expectedFlows = createExpected(expected, flowsConfig(splitters)(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('2', () => {
  const splitters = {
    extends: '___',
  };
  const actual = 'flow0';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow0',
      graph: [{[`flow0${splitters.extends}a`]: [[], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig(splitters));
  const expectedFlows = createExpected(expected, flowsConfig(splitters)(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('3', () => {
  const splitters = {
    extends: '//',
  };
  const actual = 'flow0';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow0',
      graph: [{[`flow0${splitters.extends}a`]: [[], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig(splitters));
  const expectedFlows = createExpected(expected, flowsConfig(splitters)(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});

test('4', () => {
  const splitters = {
    extends: '_flow0_',
  };
  const actual = 'flow0';
  const expected = [
    {
      name: 'a',
      graph: [{a: [[], []]}],
    },
    {
      name: 'flow0',
      graph: [{[`flow0${splitters.extends}a`]: [[], []]}],
    },
  ];

  const actualFlows = createFlows(actual, flowsConfig(splitters));
  const expectedFlows = createExpected(expected, flowsConfig(splitters)(actual));

  assertEqualFlows(expectedFlows, actualFlows);
});
