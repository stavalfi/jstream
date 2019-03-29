import {parseGraph} from './graph-parser';
import {fixAndExtendGraph} from './fix-flow-graph';
import {parseRules} from './rules-parser';
import {parseSideEffects} from './side-effects-parser';
import {
  extractUniqueFlowsNamesFromGraph,
  graphNodeToDisplayName,
  displayNameToGraphNode,
} from './utils';
import {validateFlowToParse} from './flow-validator';
import {flattenUserFlowShortcuts} from './user-shortcuts-parser';

export const parseSingleFlow = (flow, splitters, parsedFlowsUntilNow = []) => {
  const parsedFlows = flattenUserFlowShortcuts(splitters)(parsedFlowsUntilNow)(flow)
    .map(validateFlowToParse(splitters)(parsedFlowsUntilNow))
    .filter(
      flowToParse =>
        !flowToParse.name ||
        !parsedFlowsUntilNow.some(parsedFlow => parsedFlow.name === flowToParse.name),
    )
    .reduce((acc, flowToParse) => {
      const missingParsedFlows = findMissingFlowsFromDisplayName(splitters)(
        [...parsedFlowsUntilNow, ...acc],
        flowToParse,
      );
      const parsedFlows = parseFlow(
        splitters,
        [...parsedFlowsUntilNow, ...acc, ...missingParsedFlows],
        flowToParse,
      );
      return [...acc, ...missingParsedFlows, ...parsedFlows];
    }, [])
    .map(cleanPropertiesFromParsedFlow);
  return parsedFlows;
};

export const parseMultipleFlows = (flows = [], splitters, parsedFlowsUntilNow = []) => {
  const result = flows.reduce((acc, userFlow) => {
    const parsedFlows = parseSingleFlow(userFlow, splitters, acc);
    return [...acc, ...parsedFlows];
  }, parsedFlowsUntilNow);
  return result;
};

const removePointersFromNodeToHimSelf = graph =>
  graph.map((node, i) => ({
    ...node,
    childrenIndexes: node.childrenIndexes.filter(j => j !== i),
    parentsIndexes: node.parentsIndexes.filter(j => j !== i),
  }));

function parseFlow(splitters, parsedFlowsUntilNow, flowToParse, extendedParsedFlow) {
  const parsedGraph = removePointersFromNodeToHimSelf(
    parseGraph(
      graphNodeToDisplayName(splitters),
      displayNameToGraphNode(splitters)(parsedFlowsUntilNow, extendedParsedFlow),
      flowToParse.graph,
    ),
  );

  const updatedParsedGraph = fixAndExtendGraph(
    parsedFlowsUntilNow,
    extendedParsedFlow,
    parsedGraph,
    flowToParse.name,
  );

  const parsedFlow = {
    ...(flowToParse.name && {name: flowToParse.name}),
    ...(flowToParse.defaultFlowName && {
      defaultFlowName: flowToParse.defaultFlowName,
    }),
    ...(extendedParsedFlow && {extendedParsedFlow}),
    graph: updatedParsedGraph,
    ...(flowToParse.hasOwnProperty('rules') && {
      rules: parseRules(splitters)(
        parsedFlowsUntilNow,
        extendedParsedFlow,
        updatedParsedGraph,
        flowToParse.rules,
      ),
    }),
    ...(flowToParse.hasOwnProperty('side_effects') && {
      side_effects: parseSideEffects(flowToParse.side_effects),
    }),
  };

  const result = flowToParse.extendsFlows
    .flatMap(flattenUserFlowShortcuts(splitters)(parsedFlowsUntilNow, parsedFlow))
    .map(validateFlowToParse(splitters)(parsedFlowsUntilNow, parsedFlow))
    .reduce(
      (extendedParsedFlowsUntilNow, extendedFlowToParse) => {
        const missingParsedFlows = findMissingFlowsFromDisplayName(splitters)(
          parsedFlowsUntilNow,
          extendedFlowToParse,
          parsedFlow,
        );
        const parsedFlows = parseFlow(
          splitters,
          [...parsedFlowsUntilNow, ...missingParsedFlows],
          extendedFlowToParse,
          parsedFlow,
        );
        return [...extendedParsedFlowsUntilNow, ...missingParsedFlows, ...parsedFlows];
      },
      [parsedFlow],
    );

  return result;
}

// find all the flows that I didn't parse yet AND weren't defined
// explicitly by the user and then parse them.
const findMissingFlowsFromDisplayName = splitters => (
  parsedFlows,
  flowToParse,
  extendedParsedFlow,
) => {
  const flowsInGraph = extractUniqueFlowsNamesFromGraph(splitters)(flowToParse.graph);
  const missingParsedFlows = flowsInGraph
    // i send empty parsedFlows array because I want to get the names of the
    // missing flows as I ever first parsed them (or i will get name: undefined)
    // and then i remove all the flows and I already parsed by flowName.
    .flatMap(flattenUserFlowShortcuts(splitters)([], extendedParsedFlow))
    .map(validateFlowToParse(splitters)([], extendedParsedFlow))
    .filter(({name}) => parsedFlows.every(flow => flow.name !== name))
    .filter(({name}) => flowToParse.name !== name)
    .reduce((parsedFlowsUntilNow, flowToParse) => {
      const result = parseFlow(splitters, parsedFlowsUntilNow, flowToParse, extendedParsedFlow);
      return [...parsedFlowsUntilNow, ...result];
    }, []);

  return missingParsedFlows;
};

const cleanPropertiesFromParsedFlow = parsedFlow => ({
  ...(parsedFlow.name && {name: parsedFlow.name}),
  ...(parsedFlow.defaultFlowName && {
    defaultFlowName: parsedFlow.defaultFlowName,
  }),
  graph: parsedFlow.graph,
  ...(parsedFlow.hasOwnProperty('rules') && {rules: parsedFlow.rules}),
  ...(parsedFlow.hasOwnProperty('side_effects') && {side_effects: parsedFlow.side_effects}),
});
