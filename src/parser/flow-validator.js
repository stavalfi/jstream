import {
  distractDisplayNameBySplitters,
  extractUniqueFlowsNamesFromGraph,
} from './utils';
import kindof from 'kindof';

export const validateFlowToParse = splitters => (
  parsedFlowsUntilNow,
  extendedParsedFlow,
) => flowToParse => {
  if (Object.keys(flowToParse).length === 0) {
    throw new Error(`flow can't have zero properties.`);
  }

  if (flowToParse.graph) {
    if (kindof(flowToParse.graph) === 'array' && flowToParse.graph.length === 0) {
      throw new Error(
        `graph can't be an empty array. it must be a string or an array with at least 
        one string which represents the actual graph.`,
      );
    }
    const flows = extractUniqueFlowsNamesFromGraph(splitters)(flowToParse.graph);
    if (flows.length === 0) {
      throw new Error(`flow can't have zero flows in his graph.`);
    }
    if (flows.length === 1) {
      if (flowToParse.defaultFlowName) {
        throw new Error(`flow with a graph containing a single 
        flow can't have a default_flow_name property.`);
      }
      if (flowToParse.name) {
        return flowToParse;
      } else {
        if (
          splitters.identifier &&
          flowToParse.graph.some(subGraph => subGraph.indexOf(splitters.identifier) > -1)
        ) {
          return flowToParse;
        } else {
          const possibleName = distractDisplayNameBySplitters(splitters, flows[0]).partialPath[0];
          if (parsedFlowsUntilNow.some(parsedFlow => parsedFlow.name === possibleName)) {
            return flowToParse;
          } else {
            throw new Error(`flow with a single flow in his graph, must have a name property.`);
          }
        }
      }
    }
    if (flowToParse.extendsFlows.length === 0) {
      return flowToParse;
    }
    if (flows.length > 1) {
      if (flowToParse.name) {
        if (flows.includes(flowToParse.name)) {
          throw new Error(
            `flow with multiple flows in his graph, can't have a 
          name that exists in his graph as one of the flows there. 
          it indicates that there is already a parsed flow with the same name.`,
          );
        }
      }
      if (flowToParse.defaultFlowName) {
        return flowToParse;
      } else {
        throw new Error(
          `flow with multiple flows in his graph, must have a default_flow_name property.`,
        );
      }
    } else {
    }
  } else {
    return flowToParse;
  }
};

export function validateParsedFlow(flowToParse) {}
