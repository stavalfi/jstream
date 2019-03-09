import {parseGraph} from './graph-parser';
import {fixAndExtendGraph} from './fix-flow-graph';
import {
  extractUniqueFlowsNamesFromGraph,
  graphNodeToDisplayName,
  displayNameToGraphNode,
} from './utils';
import {validateFlowToParse} from './flow-validator';
import {flattenUserFlowShortcuts} from './user-shortcuts-parser';
import uuid from 'uuid/v1';

const parseFlows = (flows = [], splitters, parsedFlowsUntilNow = []) => {
  const result = flows
    .reduce((parsedFlowsUntilNowAcc1, userFlow) => {
      const parsedFlows = flattenUserFlowShortcuts(splitters)(parsedFlowsUntilNowAcc1)(userFlow)
        .map(validateFlowToParse(splitters)(parsedFlowsUntilNowAcc1))
        .reduce((parsedFlowsUntilNowAcc2, flowToParse) => {
          const missingParsedFlows = findMissingFlowsFromDisplayName(splitters)(
            parsedFlowsUntilNowAcc2,
            flowToParse,
          );
          const parsedFlows = parseFlow(
            splitters,
            [...parsedFlowsUntilNowAcc2, ...missingParsedFlows],
            flowToParse,
          );
          return [...parsedFlowsUntilNowAcc2, ...missingParsedFlows, ...parsedFlows];
        }, parsedFlowsUntilNowAcc1);
      return parsedFlows;
    }, parsedFlowsUntilNow)
    .map(cleanPropertiesFromParsedFlow);
  return result;
};

export default parseFlows;

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

  const parsedFlow = {
    id: uuid(),
    ...(flowToParse.name && {name: flowToParse.name}),
    ...(flowToParse.defaultFlowName && {
      defaultFlowName: flowToParse.defaultFlowName,
    }),
    ...(extendedParsedFlow && {extendedParsedFlow}),
    graph: fixAndExtendGraph(parsedFlowsUntilNow, extendedParsedFlow, parsedGraph),
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
  id: parsedFlow.id,
  ...(parsedFlow.name && {name: parsedFlow.name}),
  ...(parsedFlow.defaultFlowName && {
    defaultFlowName: parsedFlow.defaultFlowName,
  }),
  graph: parsedFlow.graph,
});
