import kindof from 'kindof';
import {
  distractDisplayNameBySplitters,
  extractUniqueFlowsNamesFromGraph,
} from './utils';

function getGraph(flow) {
  return kindof(flow.graph) === 'array' ? flow.graph : [flow.graph];
}

function getFlowNameObject(splitters, parsedFlows, flow, extendedParsedFlow) {
  if (flow.name) {
    return {name: flow.name};
  }
  const graph = getGraph(flow);
  const flowsInGraph = extractUniqueFlowsNamesFromGraph(splitters)(graph);
  if (flowsInGraph.length === 1) {
    // I need to be sure that the same flow does not appear multiple times in the graph with multiple identifiers.
    // 2 cases: 1. "...flow0...flow0/identifier1..." 2. "...flow0/identifier1...flow0/identifier2...".
    if (
      splitters.identifier &&
      graph.some(subGraph => subGraph.indexOf(splitters.identifier) > -1)
    ) {
      return {};
    } else {
      const possibleName = distractDisplayNameBySplitters(splitters, flowsInGraph[0])
        .partialPath[0];
      if (parsedFlows.some(parsedFlow => parsedFlow.name === possibleName)) {
        return {};
      } else {
        return {name: possibleName};
      }
    }
  } else {
    return {};
  }
}

export const flattenUserFlowShortcuts = splitters => (parsedFlows,extendedParsedFlow) =>
  function flatten(flow) {
    switch (kindof(flow)) {
      case 'string':
        return flatten(
          {
            graph: [flow],
          },
          extendedParsedFlow,
        );
      case 'array':
        return flatten(
          {
            graph: flow,
          },
          extendedParsedFlow,
        );
      case 'object':
        const graph = getGraph(flow);
        const nameObject = getFlowNameObject(splitters, parsedFlows, flow, extendedParsedFlow);
        const defaultFlowNameObject = flow.default_flow_name && {
          defaultFlowName: flow.default_flow_name,
        };
        const flowToParse = {
          graph,
          ...nameObject,
          extendsFlows: flow.extends_flows || [],
          ...defaultFlowNameObject,
        };
        return [flowToParse];
    }
  };
