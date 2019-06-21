import { parseGraph } from 'graph-parser'
import { fixAndExtendGraph } from 'fix-flow-graph'
import { parseSideEffects } from 'side-effects-parser'
import {
  arePathsEqual,
  displayNameToFullGraphNode,
  extractUniqueFlowsNamesFromGraph,
  graphNodeToDisplayName,
  isSubsetOf,
} from 'utils'
import { validateFlowToParse } from 'flow-validator'
import { flattenUserFlowShortcuts } from 'user-shortcuts-parser'
import uuid from 'uuid/v1'
import { Graph, Node, ParsedFlow, ParsedUserFlow, Splitters, UserFlow } from 'types'

type ParseMultipleFlows = ({
  userFlows,
  splitters,
  parsedFlowsUntilNow,
}: {
  userFlows: UserFlow[]
  splitters: Splitters
  parsedFlowsUntilNow?: ParsedFlow[]
}) => ParsedFlow[]
export const parseMultipleFlows: ParseMultipleFlows = ({ userFlows = [], splitters, parsedFlowsUntilNow = [] }) => {
  return parseUserFlows({
    userFlows,
    splitters,
    parsedFlowsUntilNow,
    finalMapper: (parsedFlows: ParsedFlow[]) => {
      return parsedFlows
        .map((parsedFlow, i, array) => {
          return {
            ...parsedFlow,
            ...(parsedFlow.hasOwnProperty('extendedFlowId') && {
              extendedFlowIndex: array.findIndex(flow => flow.id === parsedFlow.extendedFlowId),
            }),
          }
        })
        .map((parsedFlow: ParsedFlow) => ({
          id: parsedFlow.id,
          ...(parsedFlow.hasOwnProperty('extendedFlowIndex') && {
            extendedFlowIndex: parsedFlow.extendedFlowIndex,
          }),
          ...(parsedFlow.hasOwnProperty('name') && { name: parsedFlow.name }),
          ...(parsedFlow.hasOwnProperty('defaultNodeIndex') && {
            defaultNodeIndex: parsedFlow.defaultNodeIndex,
          }),
          graph: parsedFlow.graph,
          sideEffects: parsedFlow.sideEffects,
        }))
    },
  })
}

type ParseUserFlows = ({
  userFlows,
  splitters,
  parsedFlowsUntilNow,
  extendedParsedFlow,
  filterUserFlowPredicate,
  concatWith,
  finalMapper,
}: {
  userFlows?: UserFlow[]
  splitters: Splitters
  parsedFlowsUntilNow: ParsedFlow[]
  extendedParsedFlow?: ParsedFlow
  filterUserFlowPredicate?: (parsedFlowsUntilNow: ParsedFlow[]) => (userFlow: ParsedUserFlow, i: number) => boolean
  concatWith?: ParsedFlow[]
  finalMapper?: (parsedFlows: ParsedFlow[]) => ParsedFlow[]
}) => ParsedFlow[]
const parseUserFlows: ParseUserFlows = ({
  userFlows = [],
  splitters,
  parsedFlowsUntilNow = [],
  extendedParsedFlow,
  filterUserFlowPredicate = () => () => true,
  concatWith = [],
  finalMapper = x => x,
}) => {
  const parsedFlows = userFlows
    .reduce((acc1: ParsedFlow[], userFlow) => {
      const userFlows = flattenUserFlowShortcuts(splitters)([...parsedFlowsUntilNow, ...acc1])(userFlow)
      const result = userFlows.reduce((acc2: ParsedFlow[], userFlow, i) => {
        const acc3 = [...parsedFlowsUntilNow, ...acc1, ...acc2]
        const validatedUserFlow = validateFlowToParse(splitters)(acc3, extendedParsedFlow)(userFlow)
        if (
          !filterUserFlowPredicate(acc3)(validatedUserFlow, i) ||
          (validatedUserFlow.hasOwnProperty('name') &&
            extendedParsedFlow &&
            extendedParsedFlow.hasOwnProperty('name') &&
            extendedParsedFlow.name === validatedUserFlow.name)
        ) {
          return acc2
        }
        const missingParsedFlows = parseMissingFlowsFromDisplayName(splitters)(
          acc3,
          validatedUserFlow,
          extendedParsedFlow,
        )
        const parsedFlows = parseFlow({
          splitters,
          parsedFlowsUntilNow: [...acc3, ...missingParsedFlows],
          flowToParse: validatedUserFlow,
          extendedParsedFlow,
        })
        return [...acc2, ...missingParsedFlows, ...parsedFlows]
      }, [])

      return [...acc1, ...result]
    }, [])
    .concat(concatWith)

  return finalMapper(parsedFlows)
}

const removePointersFromNodeToHimSelf = (graph: Graph): Graph =>
  graph.map((node, i) => ({
    ...node,
    childrenIndexes: node.childrenIndexes.filter(j => j !== i),
    parentsIndexes: node.parentsIndexes.filter(j => j !== i),
  }))

type ComputeDefaultNodeIndexObject = ({
  parsedFlowsUntilNow,
  flowToParse,
  parsedGraph,
  extendedParsedFlow,
}: {
  parsedFlowsUntilNow: ParsedFlow[]
  flowToParse: ParsedUserFlow
  parsedGraph: Graph
  extendedParsedFlow?: ParsedFlow
}) => {
  defaultNodeIndex?: number
}
const computeDefaultNodeIndexObject: ComputeDefaultNodeIndexObject = ({
  parsedFlowsUntilNow,
  flowToParse,
  parsedGraph,
  extendedParsedFlow,
}) => {
  if (parsedGraph.length === 1) {
    return { defaultNodeIndex: 0 }
  }

  if (flowToParse.hasOwnProperty('defaultFlowName')) {
    const options = parsedGraph
      .map((node, i) => i)
      .filter(i => parsedGraph[i].path.includes(flowToParse.defaultFlowName as string))

    if (options.length === 1) {
      return {
        defaultNodeIndex: options[0],
      }
    } else {
      const defaultFlow = parsedFlowsUntilNow.find(flow => flow.name === flowToParse.defaultFlowName) || {}
      if (defaultFlow && defaultFlow.hasOwnProperty('defaultNodeIndex')) {
        const option = options.find(i => {
          // @ts-ignore
          return isSubsetOf(defaultFlow.graph[defaultFlow.defaultNodeIndex].path, parsedGraph[i].path)
        })
        return {
          defaultNodeIndex: option,
        }
      } else {
        const option = options.find(i => {
          // @ts-ignore
          return isSubsetOf(extendedParsedFlow.graph[extendedParsedFlow.defaultNodeIndex].path, parsedGraph[i].path)
        })
        return {
          defaultNodeIndex: option,
        }
      }
    }
  }

  const flowsIndex = flowToParse.hasOwnProperty('name') ? 1 : 0
  const differentFlows = [...new Set(parsedGraph.map(node => node.path[flowsIndex]))]
  if (differentFlows.length === 1) {
    const parsedFlow = parsedFlowsUntilNow.find(flow => flow.name === differentFlows[0])
    if (parsedFlow) {
      if (!parsedFlow.hasOwnProperty('defaultNodeIndex')) {
        return {}
      }
      const options = parsedGraph.filter(node =>
        isSubsetOf(parsedFlow.graph[parsedFlow.defaultNodeIndex as number].path, node.path),
      )
      if (options.length === 1) {
        return { defaultNodeIndex: parsedFlow.defaultNodeIndex }
      } else {
        const option = options.find(node =>
          // @ts-ignore
          isSubsetOf(extendedParsedFlow.graph[extendedParsedFlow.defaultNodeIndex].path, node.path),
        ) as Node
        const defaultNodeIndex = parsedGraph.findIndex(node => arePathsEqual(option.path, node.path))
        return { defaultNodeIndex }
      }
    } else {
      return {
        ...((extendedParsedFlow as ParsedFlow).hasOwnProperty('defaultNodeIndex') && {
          defaultNodeIndex: (extendedParsedFlow as ParsedFlow).defaultNodeIndex,
        }),
      }
    }
  } else {
    return {}
  }
}

type ParseFlow = ({
  splitters,
  parsedFlowsUntilNow,
  flowToParse,
  extendedParsedFlow,
}: {
  splitters: Splitters
  parsedFlowsUntilNow: ParsedFlow[]
  flowToParse: ParsedUserFlow
  extendedParsedFlow?: ParsedFlow
}) => ParsedFlow[]
const parseFlow: ParseFlow = ({ splitters, parsedFlowsUntilNow, flowToParse, extendedParsedFlow }) => {
  const parsedGraph = removePointersFromNodeToHimSelf(
    parseGraph(
      graphNodeToDisplayName(splitters),
      displayNameToFullGraphNode(splitters)(parsedFlowsUntilNow, flowToParse.name, extendedParsedFlow),
      flowToParse.graph,
    ),
  )

  const updatedParsedGraph = fixAndExtendGraph({
    parsedFlows: parsedFlowsUntilNow,
    flowToParse,
    parsedGraph,
    extendedParsedFlow,
  })

  const defaultNodeIndexObject = computeDefaultNodeIndexObject({
    parsedFlowsUntilNow,
    flowToParse,
    parsedGraph: updatedParsedGraph,
    extendedParsedFlow,
  })

  const parsedFlow = {
    id: uuid(),
    ...(extendedParsedFlow && { extendedFlowId: extendedParsedFlow.id }),
    ...(flowToParse.name && { name: flowToParse.name }),
    ...(extendedParsedFlow && { extendedParsedFlow }),
    ...defaultNodeIndexObject,
    graph: updatedParsedGraph,
    sideEffects: parseSideEffects(splitters)({
      parsedFlowsUntilNow,
      flowName: flowToParse.name,
      extendedParsedFlow,
      sideEffects: flowToParse.side_effects,
    }),
  }

  return parseUserFlows({
    splitters,
    extendedParsedFlow: parsedFlow,
    parsedFlowsUntilNow,
    userFlows: flowToParse.extendsFlows,
    concatWith: [parsedFlow],
  })
}

// find all the flows that I didn't parse yet AND weren't defined
// explicitly by the user and then parse them.
const parseMissingFlowsFromDisplayName = (splitters: Splitters) => (
  parsedFlows: ParsedFlow[],
  flowToParse: ParsedUserFlow,
  extendedParsedFlow?: ParsedFlow,
) => {
  const flowsNamesInGraph = extractUniqueFlowsNamesFromGraph(splitters)(flowToParse.graph)

  return parseUserFlows({
    userFlows: flowsNamesInGraph,
    splitters,
    parsedFlowsUntilNow: parsedFlows,
    extendedParsedFlow,
    filterUserFlowPredicate: parsedFlowsUntilNow => userFlow => {
      if (!userFlow.hasOwnProperty('name')) {
        if (flowsNamesInGraph.length === 1 && parsedFlowsUntilNow.some(flow => flow.name === flowsNamesInGraph[0])) {
          // to avoid recursive stack overflow exception
          return false
        } else {
          // todo: what should i return here:
          return false
        }
      } else {
        return flowToParse.name !== userFlow.name && parsedFlowsUntilNow.every(flow => flow.name !== userFlow.name)
      }
    },
  })
}
