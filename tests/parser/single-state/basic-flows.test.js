import {assertEqualFlows, createFlow} from '../utils';

const flowsConfig = {
  splitters: {
    beforeStateName: '_',
    beforeIdentifier: '-',
  },
  defaultTransition: 'a',
  stateMachine: 'a',
  workflows: [],
};

test('1', () => {
  const actualFlowArray = createFlow(flowsConfig, 'flow1');

  const expectedFlowArray = [{flow1_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('2', () => {
  const actualFlowArray = createFlow(flowsConfig, 'flow1_a');

  const expectedFlowArray = [{flow1_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('3', () => {
  const actualFlowArray = createFlow(flowsConfig, '[flow1_a]');

  const expectedFlowArray = [{flow1_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('4', () => {
  const actualFlowArray = createFlow(flowsConfig, '[[[flow1_a]]]');

  const expectedFlowArray = [{flow1_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('5', () => {
  const actualFlowArray = createFlow(flowsConfig, '[flow1]');

  const expectedFlowArray = [{flow1_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('6', () => {
  const actualFlowArray = createFlow(flowsConfig, '[[flow1]]');

  const expectedFlowArray = [{flow1_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('7', () => {
  const actualFlowArray = createFlow(flowsConfig, '[[[flow1]]]');

  const expectedFlowArray = [{flow1_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('8', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: 'flow1',
  });

  const expectedFlowArray = [{flow1_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('9', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['flow1:flow2'],
  });

  const expectedFlowArray = [{flow1_a: [1]}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('10', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['[flow1]:flow2'],
  });

  const expectedFlowArray = [{flow1_a: [1]}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('11', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['[flow1:flow2]'],
  });

  const expectedFlowArray = [{flow1_a: [1]}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('12', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['flow1:[flow2]'],
  });

  const expectedFlowArray = [{flow1_a: [1]}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('13', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['flow1:flow2,flow3:flow4'],
  });

  const expectedFlowArray = [{flow1_a: [1, 2]}, {flow2_a: [3]}, {flow3_a: [3]}, {flow4_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('14', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['flow1:flow2:flow3:flow4:flow5'],
  });

  const expectedFlowArray = [
    {flow1_a: [1]},
    {flow2_a: [2]},
    {flow3_a: [3]},
    {flow4_a: [4]},
    {flow5_a: []},
  ];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('15', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['flow1:flow2:flow3'],
  });

  const expectedFlowArray = [{flow1_a: [1]}, {flow2_a: [2]}, {flow3_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('16', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['[[flow1]:[flow2]:[flow3]]'],
  });

  const expectedFlowArray = [{flow1_a: [1]}, {flow2_a: [2]}, {flow3_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('17', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['[[flow0]:[flow1],[flow2]:[flow3]]'],
  });

  const expectedFlowArray = [{flow0_a: [1, 2]}, {flow1_a: [3]}, {flow2_a: [3]}, {flow3_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('18', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['[[flow1_a]:[flow2_a]:[flow3_a]]'],
  });

  const expectedFlowArray = [{flow1_a: [1]}, {flow2_a: [2]}, {flow3_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('19', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['[[flow1]:[flow2_a]]'],
  });

  const expectedFlowArray = [{flow1_a: [1]}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('20', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['flow1_a:flow2'],
  });

  const expectedFlowArray = [{flow1_a: [1]}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('21', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: [
      'flow0_a:flow1_a:[flow2_a:flow3_a],[flow4_a:flow5_a]',
      'flow3_a,flow5_a:flow6_a,flow7_a',
    ],
  });

  const expectedFlowArray = [
    {flow0_a: [1]}, // 0
    {flow1_a: [2, 4]}, // 1
    {flow2_a: [3]}, // 2
    {flow3_a: [6, 7]}, // 3
    {flow4_a: [5]}, // 4
    {flow5_a: [6, 7]}, // 5
    {flow6_a: []}, // 6
    {flow7_a: []}, // 7
  ];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('22', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['flow0:flow1', 'flow0:flow2'],
  });

  const expectedFlowArray = [{flow0_a: [1, 2]}, {flow1_a: []}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('23', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['flow0:flow1', 'flow0:flow2', 'flow0:flow3'],
  });

  const expectedFlowArray = [{flow0_a: [1, 2, 3]}, {flow1_a: []}, {flow2_a: []}, {flow3_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('24', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['flow0:flow1_a:[flow2_a:flow3_a],[flow4_a:flow5_a]'],
  });

  const expectedFlowArray = [
    {flow0_a: [1]}, // 0
    {flow1_a: [2, 4]}, // 1
    {flow2_a: [3]}, // 2
    {flow3_a: []}, // 3
    {flow4_a: [5]}, // 4
    {flow5_a: []}, // 5
  ];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('25', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['flow0:flow1:[flow2:flow3],[flow4:flow5]'],
  });

  const expectedFlowArray = [
    {flow0_a: [1]}, // 0
    {flow1_a: [2, 4]}, // 1
    {flow2_a: [3]}, // 2
    {flow3_a: []}, // 3
    {flow4_a: [5]}, // 4
    {flow5_a: []}, // 5
  ];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('26', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['[flow0_a:flow1_a]:flow2_a'],
  });

  const expectedFlowArray = [
    {flow0_a: [1, 2]}, // 0
    {flow1_a: []}, // 1
    {flow2_a: []}, // 2
  ];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('27', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['[flow0_a:flow1_a]:[flow2_a:flow3]'],
  });

  const expectedFlowArray = [
    {flow0_a: [1, 2]}, // 0
    {flow1_a: []}, // 1
    {flow2_a: [3]}, // 2
    {flow3_a: []}, // 3
  ];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});
test('28', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['[flow0_a:flow1_a]:[flow2_a:flow3]:flow4'],
  });

  const expectedFlowArray = [
    {flow0_a: [1, 2]}, // 0
    {flow1_a: []}, // 1
    {flow2_a: [3, 4]}, // 2
    {flow3_a: []}, // 3
    {flow4_a: []}, // 4
  ];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('29', () => {
  const actualFlowArray = createFlow(flowsConfig, {
    name: 'flow1',
    flow: ['flow0:flow1', 'flow0:flow2'],
  });

  const expectedFlowArray = [
    {flow0_a: [1, 2]}, // 0
    {flow1_a: []}, // 1
    {flow2_a: []}, // 2
  ];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});
