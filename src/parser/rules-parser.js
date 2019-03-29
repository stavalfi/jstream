import {parseGraph} from './graph-parser';
import {displayNameToGraphNode, graphNodeToDisplayName} from './utils';

export const parseRules = splitters => (
  parsedFlowsUntilNow,
  extendedParsedFlow,
  parsedGraph,
  rules,
) => {
  const toDisplayName = graphNodeToDisplayName(splitters);
  const toNode = displayNameToGraphNode(splitters)(parsedFlowsUntilNow, extendedParsedFlow);
  const result = rules.map(rule => {
    const parsedEdge = parseGraph(toDisplayName, toNode, [rule.edge]);
    return {
      edgeAsGraph: parsedEdge,
      predicate: rule.predicate,
    };
  });
  return result;
};
