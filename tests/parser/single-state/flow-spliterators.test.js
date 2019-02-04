import {assertEqualFlows, createFlow} from '../utils';
import {s} from '../../../src';

const flowsConfig = {
  defaultTransition: 'a',
  stateMachine: 'a',
  workflows: [],
};

test('1', () => {
  const completeFlowConfig = {
    ...flowsConfig,
    splitters: {
      beforeStateName: '/',
      beforeIdentifier: '-',
    },
  };
  const actualFlowArray = createFlow(completeFlowConfig, 'flow1/a');

  const expectedFlowArray = [{'flow1/a': []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray, completeFlowConfig);
});

test('2', () => {
  const completeFlowConfig = {
    ...flowsConfig,
    splitters: {
      beforeStateName: '/',
      beforeIdentifier: '-',
    },
  };
  const actualFlowArray = createFlow(completeFlowConfig, '[flow1/a:flow2/a:[flow3/a]]');

  const expectedFlowArray = [{'flow1/a': [1]}, {'flow2/a': [2]}, {'flow3/a': []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray, completeFlowConfig);
});

test('3', () => {
  const completeFlowConfig = {
    ...flowsConfig,
    splitters: {
      beforeStateName: '/',
      beforeIdentifier: '-',
    },
  };
  const actualFlowArray = createFlow(completeFlowConfig, '[flow1/a-1:flow2/a-2:[flow3/a-3]]');

  const expectedFlowArray = [{'flow1/a-1': [1]}, {'flow2/a-2': [2]}, {'flow3/a-3': []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray, completeFlowConfig);
});

test('4', () => {
  const completeFlowConfig = {
    ...flowsConfig,
    splitters: {
      beforeStateName: '/',
      beforeIdentifier: '-',
    },
  };
  const actualFlowArray = createFlow(completeFlowConfig, 'flow0-1');

  const expectedFlowArray = [{'flow0/a-1': []}];

  assertEqualFlows(expectedFlowArray, actualFlowArray, completeFlowConfig);
});
