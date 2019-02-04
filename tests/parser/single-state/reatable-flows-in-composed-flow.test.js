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
  const actualFlowArray = createFlow(flowsConfig, ['flow0:flow1', 'flow0:flow2']);

  const expectedFlowArray = [{flow0_a: [1, 2]}, {flow1_a: []}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('2', () => {
  const actualFlowArray = createFlow(flowsConfig, ['flow0_a:flow1', 'flow0:flow2']);

  const expectedFlowArray = [{flow0_a: [1, 2]}, {flow1_a: []}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('3', () => {
  const actualFlowArray = createFlow(flowsConfig, ['flow0:flow1-1', 'flow0_a:flow2-1']);

  const expectedFlowArray = [{flow0_a: [1, 2]}, {'flow1_a-1': []}, {'flow2_a-1': []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('4', () => {
  const actualFlowArray = createFlow(flowsConfig, ['flow0_a:flow1', 'flow0_a:flow2']);

  const expectedFlowArray = [{flow0_a: [1, 2]}, {flow1_a: []}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('5', () => {
  const actualFlowArray = createFlow(flowsConfig, ['flow0_a-1:flow1', 'flow0_a-1:flow2']);

  const expectedFlowArray = [{'flow0_a-1': [1, 2]}, {flow1_a: []}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('6', () => {
  const actualFlowArray = createFlow(flowsConfig, ['flow0-1:flow1', 'flow0_a-1:flow2']);

  const expectedFlowArray = [{'flow0_a-1': [1, 2]}, {flow1_a: []}, {flow2_a: []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('7', () => {
  const actualFlowArray = createFlow(flowsConfig, ['flow0-1:flow1-1', 'flow0_a-1:flow2-1']);

  const expectedFlowArray = [{'flow0_a-1': [1, 2]}, {'flow1_a-1': []}, {'flow2_a-1': []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});
