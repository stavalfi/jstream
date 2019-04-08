import {parseGraph} from './graph-parser';
import {fixAndExtendGraph} from './fix-flow-graph';
import {parseSideEffects} from './side-effects-parser';
import {
  extractUniqueFlowsNamesFromGraph,
  graphNodeToDisplayName,
  displayNameToFullGraphNode,
} from './utils';
import {validateFlowToParse} from './flow-validator';
import {flattenUserFlowShortcuts} from './user-shortcuts-parser';
import uuid from 'uuid/v1';

const parseSingleFlow = (flow, splitters, parsedFlowsUntilNow = []) => {
  const parsedFlows = flattenUserFlowShortcuts(splitters)()(flow)
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
    }, []);
  return parsedFlows;
};

export const parseMultipleFlows = (flows = [], splitters, parsedFlowsUntilNow = []) => {
  const result = flows
    .reduce((acc, userFlow) => {
      const parsedFlows = parseSingleFlow(userFlow, splitters, acc);
      return [...acc, ...parsedFlows];
    }, parsedFlowsUntilNow)
    .map((parsedFlow, i, parsedFlows) => ({
      ...parsedFlow,
      ...(parsedFlow.hasOwnProperty('extendedFlowId') && {
        extendedFlowIndex: parsedFlows.findIndex(flow => flow.id === parsedFlow.extendedFlowId),
      }),
    }))
    .map(cleanPropertiesFromParsedFlow);
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
      displayNameToFullGraphNode(splitters)(
        parsedFlowsUntilNow,
        flowToParse.name,
        extendedParsedFlow,
      ),
      flowToParse.graph,
    ),
  );

  const updatedParsedGraph = fixAndExtendGraph(
    parsedFlowsUntilNow,
    extendedParsedFlow,
    parsedGraph,
  );

  const parsedFlow = {
    id: uuid(),
    ...(extendedParsedFlow && {extendedFlowId: extendedParsedFlow.id}),
    ...(flowToParse.name && {name: flowToParse.name}),
    ...(flowToParse.defaultFlowName && {
      defaultFlowName: flowToParse.defaultFlowName,
    }),
    ...(extendedParsedFlow && {extendedParsedFlow}),
    graph: updatedParsedGraph,
    ...(flowToParse.hasOwnProperty('side_effects') && {
      side_effects: parseSideEffects(splitters)(
        parsedFlowsUntilNow,
        flowToParse.name,
        extendedParsedFlow,
        flowToParse.side_effects,
      ),
    }),
  };

  const result = flowToParse.extendsFlows
    .flatMap(flattenUserFlowShortcuts(splitters)())
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
    .flatMap(flattenUserFlowShortcuts(splitters)())
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
  ...(parsedFlow.hasOwnProperty('extendedFlowIndex') && {
    extendedFlowIndex: parsedFlow.extendedFlowIndex,
  }),
  ...(parsedFlow.name && {name: parsedFlow.name}),
  ...(parsedFlow.defaultFlowName && {
    defaultFlowName: parsedFlow.defaultFlowName,
  }),
  graph: parsedFlow.graph,
  ...(parsedFlow.hasOwnProperty('side_effects') && {sideEffects: parsedFlow.side_effects}),
});
