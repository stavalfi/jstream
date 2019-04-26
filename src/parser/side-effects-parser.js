import {displayNameToFullGraphNode} from './utils';

export const parseSideEffects = splitters => (
  parsedFlowsUntilNow,
  extendedParsedFlow,
  flowName,
  sideEffects,
) => {
  const toNode = displayNameToFullGraphNode(splitters)(parsedFlowsUntilNow,flowName, extendedParsedFlow);
  const result = sideEffects.map(({node_name, side_effect}) => {
    return {
      node: toNode(node_name),
      sideEffectFunc: side_effect,
    };
  });
  return result;
};
