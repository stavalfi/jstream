import {parseGraph} from './graph-parser';
import {fixAndExtendGraph} from './fix-flow-graph';
import {parseSideEffects} from './side-effects-parser';
import {
  extractUniqueFlowsNamesFromGraph,
  graphNodeToDisplayName,
  displayNameToFullGraphNode,
  isSubsetOf,
  arePathsEqual,
} from './utils';
import {validateFlowToParse} from './flow-validator';
import {flattenUserFlowShortcuts} from './user-shortcuts-parser';
import uuid from 'uuid/v1';
import {pipe, map, identity, addIndex} from 'ramda';

export function parseMultipleFlows1({userFlows = [], splitters = {}, parsedFlowsUntilNow = []}) {
  const result = parseUserFlows({
    userFlows,
    splitters,
    parsedFlowsUntilNow,
    finalMapper: pipe(
      addIndex(map)((parsedFlow, i, parsedFlows) => {
        return {
          ...parsedFlow,
          ...(parsedFlow.hasOwnProperty('extendedFlowId') && {
            extendedFlowIndex: parsedFlows.findIndex(flow => flow.id === parsedFlow.extendedFlowId),
          }),
        };
      }),
      map(parsedFlow => ({
        ...(parsedFlow.hasOwnProperty('extendedFlowIndex') && {
          extendedFlowIndex: parsedFlow.extendedFlowIndex,
        }),
        ...(parsedFlow.hasOwnProperty('name') && {name: parsedFlow.name}),
        ...(parsedFlow.hasOwnProperty('defaultNodeIndex') && {
          defaultNodeIndex: parsedFlow.defaultNodeIndex,
        }),
        graph: parsedFlow.graph,
        ...(parsedFlow.hasOwnProperty('side_effects') && {sideEffects: parsedFlow.side_effects}),
      })),
    ),
  });
  return result;
}

function parseUserFlows({
  userFlows = [],
  splitters = {},
  parsedFlowsUntilNow = [],
  extendedParsedFlow,
  filterUserFlowPredicate = parsedFlowsUntilNow => (userFlow, i) => true,
  concatWith = [],
  finalMapper = identity,
}) {
  const parsedFlows = userFlows.reduce((acc1, userFlow) => {
    const userFlows = flattenUserFlowShortcuts(splitters)([...parsedFlowsUntilNow, ...acc1])(
      userFlow,
    );
    const result = userFlows.reduce((acc2, userFlow, i) => {
      const acc3 = [...parsedFlowsUntilNow, ...acc1, ...acc2];
      const validatedUserFlow = validateFlowToParse(splitters)(acc3, extendedParsedFlow)(userFlow);
      if (
        !filterUserFlowPredicate(acc3)(validatedUserFlow, i) ||
        (validatedUserFlow.hasOwnProperty('name') &&
          extendedParsedFlow &&
          extendedParsedFlow.hasOwnProperty('name') &&
          extendedParsedFlow.name === validatedUserFlow.name)
      ) {
        return acc2;
      }
      const missingParsedFlows = parseMissingFlowsFromDisplayName(splitters)(
        acc3,
        validatedUserFlow,
        extendedParsedFlow,
      );
      const parsedFlows = parseFlow({
        splitters,
        parsedFlowsUntilNow: [...acc3, ...missingParsedFlows],
        flowToParse: validatedUserFlow,
        extendedParsedFlow,
      });
      return [...acc2, ...missingParsedFlows, ...parsedFlows];
    }, []);

    return [...acc1, ...result];
  }, []);

  const finalResult = finalMapper([...concatWith, ...parsedFlows]);
  return finalResult;
}

const removePointersFromNodeToHimSelf = graph =>
  graph.map((node, i) => ({
    ...node,
    childrenIndexes: node.childrenIndexes.filter(j => j !== i),
    parentsIndexes: node.parentsIndexes.filter(j => j !== i),
  }));

function computeDefaultNodeIndexObject({
  parsedFlowsUntilNow,
  flowToParse,
  parsedGraph,
  extendedParsedFlow,
}) {
  if (parsedGraph.length === 1) {
    return {defaultNodeIndex: 0};
  }
  if (flowToParse.hasOwnProperty('defaultFlowName')) {
    return {
      defaultNodeIndex: parsedGraph.findIndex(node =>
        node.path.includes(flowToParse.defaultFlowName),
      ),
    };
  }

  const flowsIndex = flowToParse.hasOwnProperty('name') ? 1 : 0;
  const differentFlows = [...new Set(parsedGraph.map(node => node.path[flowsIndex]))];
  if (differentFlows.length === 1) {
    const parsedFlow = parsedFlowsUntilNow.find(flow => flow.name === differentFlows[0]);
    if (parsedFlow) {
      if (!parsedFlow.hasOwnProperty('defaultNodeIndex')) {
        return {};
      }
      const options = parsedGraph.filter(node =>
        isSubsetOf(parsedFlow.graph[parsedFlow.defaultNodeIndex].path, node.path),
      );
      if (options.length === 1) {
        return {defaultNodeIndex: parsedFlow.defaultNodeIndex};
      } else {
        const option = options.find(node =>
          isSubsetOf(extendedParsedFlow.graph[extendedParsedFlow.defaultNodeIndex].path, node.path),
        );
        const defaultNodeIndex = parsedGraph.findIndex(node =>
          arePathsEqual(option.path, node.path),
        );
        return {defaultNodeIndex};
      }
    } else {
      return {
        ...(extendedParsedFlow.hasOwnProperty('defaultNodeIndex') && {
          defaultNodeIndex: extendedParsedFlow.defaultNodeIndex,
        }),
      };
      π;
    }
  } else {
    return {};
  }
}

function parseFlow({splitters, parsedFlowsUntilNow, flowToParse, extendedParsedFlow}) {
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

  const updatedParsedGraph = fixAndExtendGraph({
    parsedFlows: parsedFlowsUntilNow,
    flowToParse,
    parsedGraph,
    extendedParsedFlow,
  });

  const defaultNodeIndexObject = computeDefaultNodeIndexObject({
    parsedFlowsUntilNow,
    flowToParse,
    parsedGraph: updatedParsedGraph,
    extendedParsedFlow,
  });

  const parsedFlow = {
    id: uuid(),
    ...(extendedParsedFlow && {extendedFlowId: extendedParsedFlow.id}),
    ...(flowToParse.name && {name: flowToParse.name}),
    ...(extendedParsedFlow && {extendedParsedFlow}),
    ...defaultNodeIndexObject,
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

  const result = parseUserFlows({
    splitters,
    extendedParsedFlow: parsedFlow,
    parsedFlowsUntilNow,
    userFlows: flowToParse.extendsFlows,
    concatWith: [parsedFlow],
  });

  return result;
}

// find all the flows that I didn't parse yet AND weren't defined
// explicitly by the user and then parse them.
const parseMissingFlowsFromDisplayName = splitters => (
  parsedFlows,
  flowToParse,
  extendedParsedFlow,
) => {
  const flowsNamesInGraph = extractUniqueFlowsNamesFromGraph(splitters)(flowToParse.graph);

  const missingParsedFlows = parseUserFlows({
    userFlows: flowsNamesInGraph,
    splitters,
    parsedFlowsUntilNow: parsedFlows,
    extendedParsedFlow,
    filterUserFlowPredicate: parsedFlowsUntilNow => userFlow => {
      if (!userFlow.hasOwnProperty('name')) {
        if (
          flowsNamesInGraph.length === 1 &&
          parsedFlowsUntilNow.some(flow => flow.name === flowsNamesInGraph)
        ) {
          // to avoid recursive stack overflow exception
          return false;
        }
      } else {
        return (
          flowToParse.name !== userFlow.name &&
          parsedFlowsUntilNow.every(flow => flow.name !== userFlow.name)
        );
      }
    },
  });

  return missingParsedFlows;
};
