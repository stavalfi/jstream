import {extractEdgesAsArray, findCharIndex} from './utils';
import parse from './parser';
import {compose} from 'redux';

export default function parseFlowGraph({defaultTransition, flows, splitters}) {
  return flows.map(edges =>
    parse({
      edges: extractEdgesAsArray(edges),
      improveDisplayName: compose(
        flowNodeToDisplayName({defaultTransition, splitters}),
        displayNameToFlowNode(splitters),
      ),
      displayNameToNode: displayNameToFlowNode(splitters),
      nodeToDisplayName: flowNodeToDisplayName({defaultTransition, splitters}),
    }),
  );
}

export const flowNodeToDisplayName = ({defaultTransition, splitters}) => node => {
  if (node.stateName) {
    if (node.identifier) {
      return `${node.flowName}${splitters.beforeStateName}${node.stateName}${
        splitters.beforeIdentifier
      }${node.identifier}`;
    } else {
      return `${node.flowName}${splitters.beforeStateName}${node.stateName}`;
    }
  } else {
    if (node.identifier) {
      return `${node.flowName}${splitters.beforeStateName}${defaultTransition}${
        splitters.beforeIdentifier
      }${node.identifier}`;
    } else {
      return `${node.flowName}${splitters.beforeStateName}${defaultTransition}`;
    }
  }
};

export const displayNameToFlowNode = splitters => displayName => {
  const endIndexOfFlowName = findCharIndex({
    str: displayName,
    fromIndex: 0,
    toIndex: displayName.length - 1,
    chars: [splitters.beforeStateName, splitters.beforeIdentifier],
  });

  if (endIndexOfFlowName === displayName.length) return {flowName: displayName};

  const flowName = displayName.slice(0, endIndexOfFlowName);

  const splitterNameToStringName = {
    beforeStateName: 'stateName',
    beforeIdentifier: 'identifier',
  };

  return Object.keys(splitters)
    .map(splitterName => ({
      splitterName,
      splitter: splitters[splitterName],
      startIndex:
        findCharIndex({
          str: displayName,
          fromIndex: endIndexOfFlowName,
          toIndex: displayName.length - 1,
          chars: [splitters[splitterName]],
        }) + 1,
    }))
    .filter(info => info.startIndex < displayName.length)
    .map(info => ({
      ...info,
      endIndex:
        findCharIndex({
          str: displayName,
          fromIndex: info.startIndex + 1,
          toIndex: displayName.length - 1,
          chars: Object.values(splitters),
        }) - 1,
    }))
    .map(info => ({
      ...info,
      str: displayName.slice(info.startIndex, info.endIndex + 1),
    }))
    .map(info => ({
      [splitterNameToStringName[info.splitterName]]: info.str,
    }))
    .reduce((obj, element) => ({...obj, ...element}), {flowName});
};
