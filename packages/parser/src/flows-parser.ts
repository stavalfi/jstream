import { parseGraph } from '@parser/graph-parser'
import { fixAndExtendGraph } from '@parser/fix-flow-graph'
import {
  arePathsEqual,
  displayNameToFullGraphNode,
  extractUniqueFlowsNamesFromGraph,
  graphNodeToDisplayName,
  isSubsetOf,
  removeSavedProps,
} from '@parser/utils'
import { validateParsedUserFlow } from '@parser/validators/parsed-user-flow-validator'
import { flattenUserFlowShortcuts } from '@parser/user-shortcuts-parser'
import { removeProp, uuid } from '@jstream/utils'
import {
  AlgorithmParsedFlow,
  Graph,
  Node,
  ParsedFlow,
  ParsedUserFlow,
  ParseExtensionsProps,
  Splitters,
  UserFlow,
} from '@parser/types'
import { flowPathsGroups } from '@parser/flow-paths-groups'
import { validateUserFlow } from '@parser/validators/user-flow-validator'
import { validateParsedFlow } from '@parser/validators/parsed-flow-validator'

export function parseMultipleFlows<UnparsedExtensions, Extensions>({
  userFlows,
  splitters,
  parseExtensionsProps,
  parsedFlowsUntilNow,
}: {
  userFlows: UserFlow<UnparsedExtensions>[]
  splitters: Splitters
  parseExtensionsProps: ParseExtensionsProps<UnparsedExtensions, Extensions>
  parsedFlowsUntilNow?: AlgorithmParsedFlow<Extensions>[]
}): ParsedFlow<Extensions>[] {
  return parseUserFlows({
    userFlows,
    splitters,
    parsedFlowsUntilNow,
    finalMapper: parsedFlows =>
      parsedFlows.map((parsedFlow, i, array) => {
        const copy = { ...parsedFlow }
        'extendedFlowId' in copy && delete copy.extendedFlowId
        return {
          ...copy,
          ...('extendedFlowId' in parsedFlow && {
            extendedFlowIndex: array.findIndex(flow => flow.id === parsedFlow.extendedFlowId),
          }),
        }
      }),
    parseExtensionsProps,
  })
}

function parseUserFlows<UnparsedExtensions, Extensions>({
  userFlows = [],
  splitters,
  parsedFlowsUntilNow = [],
  extendedParsedFlow,
  concatWith = [],
  finalMapper = x => x,
  parseExtensionsProps,
}: {
  userFlows?: UserFlow<UnparsedExtensions>[]
  splitters: Splitters
  parsedFlowsUntilNow?: AlgorithmParsedFlow<Extensions>[]
  extendedParsedFlow?: AlgorithmParsedFlow<Extensions>
  concatWith?: AlgorithmParsedFlow<Extensions>[]
  finalMapper?: (parsedFlows: AlgorithmParsedFlow<Extensions>[]) => AlgorithmParsedFlow<Extensions>[]
  parseExtensionsProps: ParseExtensionsProps<UnparsedExtensions, Extensions>
}): AlgorithmParsedFlow<Extensions>[] {
  const parsedFlows: ParsedFlow<Extensions>[] = [...concatWith]

  for (const userFlow of userFlows) {
    const flows: ParsedFlow<Extensions>[] = [...parsedFlowsUntilNow, ...parsedFlows]
    validateUserFlow(splitters)(flows, extendedParsedFlow)(userFlow)

    const parsedUserFlow = flattenUserFlowShortcuts(splitters)(flows)(userFlow)

    validateParsedUserFlow(splitters)(flows, extendedParsedFlow)(parsedUserFlow)

    const missingParsedFlows = parseMissingFlowsFromDisplayName(splitters)(
      flows,
      parsedUserFlow,
      parseExtensionsProps,
      extendedParsedFlow,
    )

    const newParsedFlows = parseFlow({
      splitters,
      parsedFlowsUntilNow: [...flows, ...missingParsedFlows],
      userFlow,
      flowToParse: parsedUserFlow,
      extendedParsedFlow,
      parseExtensionsProps,
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

function computeDefaultNodeIndexObject<UnparsedExtensions, Extensions>({
  parsedFlowsUntilNow,
  flowToParse,
  parsedGraph,
  extendedParsedFlow,
}: {
  parsedFlowsUntilNow: AlgorithmParsedFlow<Extensions>[]
  flowToParse: ParsedUserFlow<UnparsedExtensions>
  parsedGraph: Graph
  extendedParsedFlow?: AlgorithmParsedFlow<Extensions>
}):
  | {
      defaultNodeIndex: number
    }
  | {} {
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

function parseFlow<UnparsedExtensions, Extensions>({
  splitters,
  parsedFlowsUntilNow,
  userFlow,
  flowToParse,
  extendedParsedFlow,
  parseExtensionsProps,
}: {
  splitters: Splitters
  parsedFlowsUntilNow: AlgorithmParsedFlow<Extensions>[]
  userFlow: UserFlow<UnparsedExtensions>
  flowToParse: ParsedUserFlow<UnparsedExtensions>
  parseExtensionsProps: ParseExtensionsProps<UnparsedExtensions, Extensions>
  extendedParsedFlow?: AlgorithmParsedFlow<Extensions>
}): AlgorithmParsedFlow<Extensions>[] {
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

  const parsedFlowWithoutExt: AlgorithmParsedFlow<{}> = {
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
  }

  const unparsedExtProps = removeSavedProps(flowToParse)
  const extProps = parseExtensionsProps({
    extProps: unparsedExtProps,
    parsedFlow: parsedFlowWithoutExt,
    splitters,
  })

  const parsedFlow: AlgorithmParsedFlow<Extensions> = {
    ...removeSavedProps(extProps, true),
    ...parsedFlowWithoutExt,
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
    parseExtensionsProps,
  })
}

// find all the flows that I didn't parse yet AND weren't defined
// explicitly by the user and then parse them.
const parseMissingFlowsFromDisplayName = (splitters: Splitters) =>
  function<UnparsedExtensions, Extensions>(
    parsedFlows: AlgorithmParsedFlow<Extensions>[],
    flowToParse: ParsedUserFlow<UnparsedExtensions>,
    parseExtensionsProps: ParseExtensionsProps<UnparsedExtensions, Extensions>,
    extendedParsedFlow?: AlgorithmParsedFlow<Extensions>,
  ) {
    const parsedFlowNames = parsedFlows.map(f => f.name).filter(Boolean) as string[]

    const uniqueFlowsNames = extractUniqueFlowsNamesFromGraph(splitters)(flowToParse.graph)
    const flowsNamesInGraph = uniqueFlowsNames.filter(flowName => !parsedFlowNames.includes(flowName))

    if (
      flowsNamesInGraph.length === 0 ||
      (flowsNamesInGraph.length === 1 && flowToParse.name === flowsNamesInGraph[0])
    ) {
      return []
    } else {
      return parseUserFlows({
        userFlows: flowsNamesInGraph,
        splitters,
        parsedFlowsUntilNow: parsedFlows,
        parseExtensionsProps,
        extendedParsedFlow,
      })
    }
  }
