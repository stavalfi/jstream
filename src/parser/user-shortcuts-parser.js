import kindof from 'kindof';
import {distractDisplayNameBySplitters, extractUniqueFlowsNamesFromGraph} from './utils';

function getGraph(flow) {
  return kindof(flow.graph) === 'array' ? flow.graph : [flow.graph];
}

function getFlowNameObject(splitters, parsedFlowsUntilNow, flow) {
  if (flow.hasOwnProperty('name')) {
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
      if (parsedFlowsUntilNow.some(flow => flow.name === possibleName)) {
        return {};
      } else {
        return {name: possibleName};
      }
    }
  } else {
    return {};
  }
}

export const flattenUserFlowShortcuts = splitters => parsedFlowsUntilNow =>
  function flatten(flow) {
    switch (kindof(flow)) {
      case 'string':
        return flatten({
          graph: [flow],
        });
      case 'array':
        return flatten({
          graph: flow,
        });
      case 'object':
        const graph = getGraph(flow);
        const nameObject = getFlowNameObject(splitters, parsedFlowsUntilNow, flow);
        const defaultFlowNameObject = flow.default_flow_name && {
          defaultFlowName: flow.default_flow_name,
        };
        const flowToParse = {
          graph,
          ...nameObject,
          extendsFlows: flow.extends_flows || [],
          ...defaultFlowNameObject,
          ...(flow.hasOwnProperty('side_effects') && {side_effects: flow.side_effects}),
        };
        return [flowToParse];
    }
  };
