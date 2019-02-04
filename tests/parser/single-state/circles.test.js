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
  const actualFlowArray = createFlow(flowsConfig, ['flow0:flow1:flow0']);

  const expectedFlowArray = [{flow0_a: [1]}, {flow1_a: [0]}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('2', () => {
  const actualFlowArray = createFlow(flowsConfig, ['flow0-1:flow1:flow0_a-1']);

  const expectedFlowArray = [{'flow0_a-1': [1]}, {flow1_a: [0]}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('3', () => {
  const actualFlowArray = createFlow(flowsConfig, ['flow0:flow1:flow0:flow1']);

  const expectedFlowArray = [{flow0_a: [1]}, {flow1_a: [0]}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});

test('4', () => {
  const actualFlowArray = createFlow(flowsConfig, ['flow0:flow1', 'flow1:flow0']);

  const expectedFlowArray = [{flow0_a: [1]}, {flow1_a: [0]}];

  assertEqualFlows(expectedFlowArray, actualFlowArray);
});
