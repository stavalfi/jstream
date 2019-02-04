import {extractEdgesAsArray} from './utils';
import parse from './parser';

export default function parseStateMachineGraph({defaultTransition, stateMachine, splitters}) {
  const stateMachineArray1 = parse({
    edges: extractEdgesAsArray(stateMachine),
    displayNameToNode: displayNameToStateNode,
  });
  return markDefaultTransitionNodes(defaultTransition, stateMachineArray1);
}

const displayNameToStateNode = displayName => {
  return {stateName: displayName};
};

function markDefaultTransitionNodes(defaultTransition, stateMachineArray) {
  const newStateMachineArray = stateMachineArray.map(node =>
    node.stateName === defaultTransition
      ? {
          ...node,
          isOnDefaultTransition: true,
        }
      : node,
  );

  const defaultTransitionNodeIndex = newStateMachineArray.findIndex(
    node => node.isOnDefaultTransition,
  );

  function fillDefaultTransition(i) {
    newStateMachineArray[i].isOnDefaultTransition = false;
    newStateMachineArray[i].parentsIndexes.forEach(fillDefaultTransition);
  }

  newStateMachineArray[defaultTransitionNodeIndex].parentsIndexes.forEach(fillDefaultTransition);

  return newStateMachineArray;
}
