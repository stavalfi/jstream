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

// import {assertEqualFlows, createFlow} from './utils';
// import {s} from '../../src';
//
// const workflowConfig = {
//   defaultTransition: 'b',
//   flowStateMachine: [
//     "a:b,c"
//   ],
//   workflows: []
// };
//
// test('flow1', () => {
//   const actualFlowArray = createFlow(workflowConfig, 'flow1');
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]},
//     {'flow1_b': []},
//     {'flow1_c': []},
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
//
// test('flow2', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'flow1',
//     flow: 'flow1'
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]},
//     {'flow1_b': []},
//     {'flow1_c': []},
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
// test('flow3', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'flow1',
//     flow: [
//       "flow1:flow2"
//     ]
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]},
//     {'flow1_b': [3]},
//     {'flow1_c': []},
//     {'flow2_a': [4, 5]},
//     {'flow2_b': []},
//     {'flow2_c': []},
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
// test('flow20', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'flow1',
//     flow: [
//       "[flow1]:flow2"
//     ]
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]},
//     {'flow1_b': [3]},
//     {'flow1_c': []},
//     {'flow2_a': [4, 5]},
//     {'flow2_b': []},
//     {'flow2_c': []},
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
// test('flow21', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'flow1',
//     flow: [
//       "[flow1:flow2]"
//     ]
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]},
//     {'flow1_b': [3]},
//     {'flow1_c': []},
//     {'flow2_a': [4, 5]},
//     {'flow2_b': []},
//     {'flow2_c': []},
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
// test('flow4', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'flow1',
//     flow: [
//       "flow1:[flow2]"
//     ]
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]},
//     {'flow1_b': [3]},
//     {'flow1_c': []},
//     {'flow2_a': [4, 5]},
//     {'flow2_b': []},
//     {'flow2_c': []},
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
// test('flow5', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'flow1',
//     flow: [
//       "flow1:flow2,flow3:flow4"
//     ]
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]}, // 0
//     {'flow1_b': [3]}, // 1
//     {'flow1_c': []},// 2
//     {'flow2_a': [4, 5]},// 3
//     {'flow2_b': [6]},// 4
//     {'flow2_c': []},// 5
//     {'flow3_a': [7, 8]},// 6
//     {'flow3_b': [9]},// 7
//     {'flow3_c': []},// 8
//     {'flow4_a': [10, 11]},// 9
//     {'flow4_b': []}, // 10
//     {'flow4_c': []},// 11
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
// test('flow6', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'flow1',
//     flow: [
//       "flow1:flow2:flow3:flow4:flow5"
//     ]
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]}, // 0
//     {'flow1_b': [3]}, // 1
//     {'flow1_c': []},// 2
//     {'flow2_a': [4, 5]},// 3
//     {'flow2_b': [6]},// 4
//     {'flow2_c': []},// 5
//     {'flow3_a': [7, 8]},// 6
//     {'flow3_b': [9]},// 7
//     {'flow3_c': []},// 8
//     {'flow4_a': [10, 11]},// 9
//     {'flow4_b': [12]}, // 10
//     {'flow4_c': []},// 11
//     {'flow5_a': [13, 14]},// 12
//     {'flow5_b': []},// 13
//     {'flow5_c': []},// 14
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
// test('flow7', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'composed-flow-1',
//     flow: [
//       "flow1:flow2:flow3"
//     ]
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]}, // 0
//     {'flow1_b': [3]}, // 1
//     {'flow1_c': []},// 2
//     {'flow2_a': [4, 5]},// 3
//     {'flow2_b': [6]},// 4
//     {'flow2_c': []},// 5
//     {'flow3_a': [7, 8]},// 6
//     {'flow3_b': []},// 7
//     {'flow3_c': []},// 8
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
// test('flow8', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'flow1',
//     flow: [
//       "[[flow1]:[flow2],[flow3]:[flow4]]"
//     ]
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]}, // 0
//     {'flow1_b': [3, 6]}, // 1
//     {'flow1_c': []},// 2
//     {'flow2_a': [4, 5]},// 3
//     {'flow2_b': [9]},// 4
//     {'flow2_c': []},// 5
//     {'flow3_a': [7, 8]},// 6
//     {'flow3_b': [9]},// 7
//     {'flow3_c': []},// 8
//     {'flow4_a': [10, 11]},// 9
//     {'flow4_b': []}, // 10
//     {'flow4_c': []},// 11
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
// test('flow9', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'flow1',
//     flow: [
//       "[[flow1]:[flow2]:[flow3]]"
//     ]
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]}, // 0
//     {'flow1_b': [3]}, // 1
//     {'flow1_c': []},// 2
//     {'flow2_a': [4, 5]},// 3
//     {'flow2_b': []},// 4
//     {'flow2_c': []},// 5
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
// test('flow10', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'flow1',
//     flow: [
//       "flow1_a:flow1_b:[flow2_a:flow2_b,flow2_c],[flow3_a:flow3_b,flow3_c]:flow4_a:flow4_b"
//     ]
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]}, // 0
//     {'flow1_b': [3, 6]}, // 1
//     {'flow1_c': []},// 2
//     {'flow2_a': [4, 5]},// 3
//     {'flow2_b': [9]},// 4
//     {'flow2_c': []},// 5
//     {'flow3_a': [7, 8]},// 6
//     {'flow3_b': [9]},// 7
//     {'flow3_c': []},// 8
//     {'flow4_a': [10, 11]},// 9
//     {'flow4_b': []}, // 10
//     {'flow4_c': []},// 11
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
//
// test('flow11', () => {
//   const actualFlowArray = createFlow(workflowConfig, {
//     name: 'composed-flow-1',
//     flow: [
//       "[[flow1_a]:[flow1_b]]"
//     ]
//   });
//
//   const expectedFlowArray = [
//     {'flow1_a': [1, 2]}, // 0
//     {'flow1_b': [3]}, // 1
//     {'flow1_c': []},// 2
//     {'flow2_a': [4, 5]},// 3
//     {'flow2_b': []},// 4
//     {'flow2_c': []},// 5
//   ];
//
//   assertEqualFlows(expectedFlowArray, actualFlowArray);
// });
