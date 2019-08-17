import { parseGraph } from '@parser/graph-parser'
import { fixAndExtendGraph } from '@parser/fix-flow-graph'
import { parseSideEffects } from '@parser/side-effects-parser'
import {
  arePathsEqual,
  displayNameToFullGraphNode,
  extractUniqueFlowsNamesFromGraph,
  graphNodeToDisplayName,
  isSubsetOf,
} from '@parser/utils'
import { validateParsedUserFlow } from '@parser/validators/parsed-user-flow-validator'
import { flattenUserFlowShortcuts } from '@parser/user-shortcuts-parser'
import { uuid } from '@jstream/utils'
import { AlgorithmParsedFlow, Graph, Node, ParsedFlow, ParsedUserFlow, Splitters, UserFlow } from '@parser/types'
import { parseRules } from '@parser/rules-parser'
import { flowPathsGroups } from '@parser/flow-paths-groups'
import { validateUserFlow } from '@parser/validators/user-flow-validator'
import { validateParsedFlow } from '@parser/validators/parsed-flow-validator'

type ParseMultipleFlows = ({
  userFlows,
  splitters,
  parsedFlowsUntilNow,
}: {
  userFlows: UserFlow[]
  splitters: Splitters
  parsedFlowsUntilNow?: AlgorithmParsedFlow[]
}) => ParsedFlow[]
export const parseMultipleFlows: ParseMultipleFlows = ({ userFlows = [], splitters, parsedFlowsUntilNow = [] }) => {
  return parseUserFlows({
    userFlows,
    splitters,
    parsedFlowsUntilNow,
    finalMapper: parsedFlows =>
      parsedFlows
        .map((parsedFlow, i, array) => ({
          ...parsedFlow,
          ...('extendedFlowId' in parsedFlow && {
            extendedFlowIndex: array.findIndex(flow => flow.id === parsedFlow.extendedFlowId),
          }),
        }))
        .map((parsedFlow: AlgorithmParsedFlow) => ({
          id: parsedFlow.id,
          ...('extendedFlowIndex' in parsedFlow && {
            extendedFlowIndex: parsedFlow.extendedFlowIndex,
          }),
          hasPredefinedName: parsedFlow.hasPredefinedName,
          name: parsedFlow.name,
          ...('defaultNodeIndex' in parsedFlow && {
            defaultNodeIndex: parsedFlow.defaultNodeIndex,
          }),
          maxConcurrency: parsedFlow.maxConcurrency,
          graph: parsedFlow.graph,
          pathsGroups: parsedFlow.pathsGroups,
          sideEffects: parsedFlow.sideEffects,
          rules: parsedFlow.rules,
        })),
  })
}

type ParseUserFlows = ({
  userFlows,
  splitters,
  parsedFlowsUntilNow,
  extendedParsedFlow,
  concatWith,
  finalMapper,
}: {
  userFlows?: UserFlow[]
  splitters: Splitters
  parsedFlowsUntilNow: AlgorithmParsedFlow[]
  extendedParsedFlow?: AlgorithmParsedFlow
  concatWith?: AlgorithmParsedFlow[]
  finalMapper?: (parsedFlows: AlgorithmParsedFlow[]) => AlgorithmParsedFlow[]
}) => AlgorithmParsedFlow[]
const parseUserFlows: ParseUserFlows = ({
  userFlows = [],
  splitters,
  parsedFlowsUntilNow = [],
  extendedParsedFlow,
  concatWith = [],
  finalMapper = x => x,
}) => {
  const parsedFlows: ParsedFlow[] = [...concatWith]

  for (const userFlow of userFlows) {
    const flows: ParsedFlow[] = [...parsedFlowsUntilNow, ...parsedFlows]
    validateUserFlow(splitters)(flows, extendedParsedFlow)(userFlow)

    const parsedUserFlow = flattenUserFlowShortcuts(splitters)(flows)(userFlow)

    validateParsedUserFlow(splitters)(flows, extendedParsedFlow)(parsedUserFlow)

    const missingParsedFlows = parseMissingFlowsFromDisplayName(splitters)(flows, parsedUserFlow, extendedParsedFlow)

    const newParsedFlows = parseFlow({
      splitters,
      parsedFlowsUntilNow: [...flows, ...missingParsedFlows],
      userFlow,
      flowToParse: parsedUserFlow,
      extendedParsedFlow,
    })

    parsedFlows.push(...missingParsedFlows, ...newParsedFlows)
  }

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
  parsedFlowsUntilNow: AlgorithmParsedFlow[]
  flowToParse: ParsedUserFlow
  parsedGraph: Graph
  extendedParsedFlow?: AlgorithmParsedFlow
}) =>
  | {
      defaultNodeIndex: number
    }
  | {}
const computeDefaultNodeIndexObject: ComputeDefaultNodeIndexObject = ({
  parsedFlowsUntilNow,
  flowToParse,
  parsedGraph,
  extendedParsedFlow,
}) => {
  if (parsedGraph.length === 1) {
    return { defaultNodeIndex: 0 }
  }

  if ('defaultPath' in flowToParse) {
    const { defaultPath } = flowToParse
    const options = parsedGraph.map((node, i) => i).filter(i => isSubsetOf(defaultPath, parsedGraph[i].path))

    if (options.length === 1) {
      return {
        defaultNodeIndex: options[0],
      }
    } else {
      const defaultFlow = parsedFlowsUntilNow.find(flow => flow.name === defaultPath[defaultPath.length - 1]) || {}
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
          // @ts-ignores
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
      if (!('defaultNodeIndex' in parsedFlow)) {
        return {}
      }
      const options = parsedGraph.filter(node =>
        isSubsetOf(parsedFlow.graph[parsedFlow.defaultNodeIndex].path, node.path),
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
        ...(extendedParsedFlow &&
          'defaultNodeIndex' in extendedParsedFlow && {
            defaultNodeIndex: extendedParsedFlow.defaultNodeIndex,
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
  userFlow,
  flowToParse,
  extendedParsedFlow,
}: {
  splitters: Splitters
  parsedFlowsUntilNow: AlgorithmParsedFlow[]
  userFlow: UserFlow
  flowToParse: ParsedUserFlow
  extendedParsedFlow?: AlgorithmParsedFlow
}) => AlgorithmParsedFlow[]
const parseFlow: ParseFlow = ({ splitters, parsedFlowsUntilNow, userFlow, flowToParse, extendedParsedFlow }) => {
  const parsedGraph = removePointersFromNodeToHimSelf(
    parseGraph(
      graphNodeToDisplayName(splitters),
      displayNameToFullGraphNode(splitters)({
        parsedFlows: parsedFlowsUntilNow,
        flowToParse,
        extendedParsedFlow: extendedParsedFlow,
      }),
      flowToParse.graph,
    ),
  )

  const updatedParsedGraph = fixAndExtendGraph({
    splitters,
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

  const parsedFlow: ParsedFlow = {
    id: uuid(),
    ...(extendedParsedFlow && { extendedFlowId: extendedParsedFlow.id }),
    hasPredefinedName: flowToParse.hasPredefinedName,
    name: flowToParse.name,
    ...(extendedParsedFlow && { extendedParsedFlow }),
    ...defaultNodeIndexObject,
    graph: updatedParsedGraph,
    pathsGroups: flowPathsGroups({
      parsedFlows: parsedFlowsUntilNow,
      parsedGraph: updatedParsedGraph,
      flowToParse,
      extendedParsedFlow,
    }),
    maxConcurrency: flowToParse.maxConcurrency,
    sideEffects: parseSideEffects(splitters)({
      parsedGraph: updatedParsedGraph,
      flowToParse,
    }),
    rules: parseRules(splitters)({
      parsedGraph: updatedParsedGraph,
      flowToParse,
    }),
  }

  validateParsedFlow(splitters)({
    userFlow,
    parsedUserFlow: flowToParse,
    flows: parsedFlowsUntilNow,
  })(parsedFlow)

  return parseUserFlows({
    splitters,
    extendedParsedFlow: parsedFlow,
    parsedFlowsUntilNow,
    userFlows: 'extendsFlows' in flowToParse ? flowToParse.extendsFlows : [],
    concatWith: [parsedFlow],
  })
}

// find all the flows that I didn't parse yet AND weren't defined
// explicitly by the user and then parse them.
const parseMissingFlowsFromDisplayName = (splitters: Splitters) => (
  parsedFlows: AlgorithmParsedFlow[],
  flowToParse: ParsedUserFlow,
  extendedParsedFlow?: AlgorithmParsedFlow,
) => {
  const parsedFlowNames = parsedFlows.map(f => f.name).filter(Boolean) as string[]

  const uniqueFlowsNames = extractUniqueFlowsNamesFromGraph(splitters)(flowToParse.graph)
  const flowsNamesInGraph = uniqueFlowsNames.filter(flowName => !parsedFlowNames.includes(flowName))

  if (flowsNamesInGraph.length === 0 || (flowsNamesInGraph.length === 1 && flowToParse.name === flowsNamesInGraph[0])) {
    return []
  } else {
    return parseUserFlows({
      userFlows: flowsNamesInGraph,
      splitters,
      parsedFlowsUntilNow: parsedFlows,
      extendedParsedFlow,
    })
  }
}
