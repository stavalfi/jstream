import {parse} from '../../src/parser';
import '../';
import {displayNameToFlowNode} from '../../src/parser/flow-parser';

export const createFlow = (workflowsConfig, flow) =>
  parse({
    ...workflowsConfig,
    flows: [flow],
  }).flows[0];

export const convertExpectedWorkflowArray = (expectedWorkflowArray, workflowConfig) =>
  expectedWorkflowArray.map(node => ({
    ...displayNameToFlowNode(workflowConfig.splitters)(Object.keys(node)[0]),
    childrenIndexes: node[Object.keys(node)[0]],
  }));

export const assertEqualFlows = (
  expectedFlowArray,
  actualFlowArray,
  workflowConfig = {
    splitters: {
      beforeStateName: '_',
      beforeIdentifier: '-',
    },
  },
) => {
  assertEqualWorkflows(expectedFlowArray, actualFlowArray, workflowConfig);
};

export const assertEqualWorkflows = (
  expectedWorkflowArray,
  actualWorkflowArray,
  workflowConfig = {},
) => {
  const expectedWorkflowArrayFixed = convertExpectedWorkflowArray(
    expectedWorkflowArray,
    workflowConfig,
  );

  // to prevent stack-overflow when we visit each node in the actual and expected graph, we will track where we already been.
  let expectedVisitedArray = expectedWorkflowArray.map(() => false);
  let actualVisitedArray = expectedWorkflowArray.map(() => false);

  function assertExpectedNodesExistInActualNodes(indexInExpected, indexInActual) {
    if (expectedVisitedArray[indexInExpected] && actualVisitedArray[indexInExpected]) return;
    expectedVisitedArray[indexInExpected] = true;
    actualVisitedArray[indexInExpected] = true;

    const expected = expectedWorkflowArrayFixed[indexInExpected];
    const actual = actualWorkflowArray[indexInActual];

    expect(actual.flowName).toBe(expected.flowName);
    expect(actual.stateName).toBe(expected.stateName);
    expect(actual.identifier).toBe(expected.identifier);

    expected.childrenIndexes.forEach(expectedChildIndex =>
      assertActualNodesExistInExpectedNodes(
        expectedChildIndex,
        actual.childrenIndexes.find(
          actualChildIndex =>
            actualWorkflowArray[actualChildIndex].flowName ===
              expectedWorkflowArrayFixed[expectedChildIndex].flowName &&
            actualWorkflowArray[actualChildIndex].stateName ===
              expectedWorkflowArrayFixed[expectedChildIndex].stateName,
        ),
      ),
    );
  }

  assertExpectedNodesExistInActualNodes(0, 0);

  expectedVisitedArray = expectedWorkflowArray.map(() => false);
  actualVisitedArray = expectedWorkflowArray.map(() => false);

  function assertActualNodesExistInExpectedNodes(indexInExpected, indexInActual) {
    if (expectedVisitedArray[indexInExpected] && actualVisitedArray[indexInExpected]) return;
    expectedVisitedArray[indexInExpected] = true;
    actualVisitedArray[indexInExpected] = true;

    const expected = expectedWorkflowArrayFixed[indexInExpected];
    const actual = actualWorkflowArray[indexInActual];

    expect(actual.flowName).toBe(expected.flowName);
    expect(actual.stateName).toBe(expected.stateName);
    expect(actual.identifier).toBe(expected.identifier);

    actual.childrenIndexes.forEach(actualChildIndex =>
      assertExpectedNodesExistInActualNodes(
        expected.childrenIndexes.find(
          expectedChildIndex =>
            actualWorkflowArray[actualChildIndex].flowName ===
              expectedWorkflowArrayFixed[expectedChildIndex].flowName &&
            actualWorkflowArray[actualChildIndex].stateName ===
              expectedWorkflowArrayFixed[expectedChildIndex].stateName,
        ),
        actualChildIndex,
      ),
    );
  }

  assertActualNodesExistInExpectedNodes(0, 0);
};
