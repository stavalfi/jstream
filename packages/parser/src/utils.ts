import _escapeRegExp from 'lodash/escapeRegExp'
import { AlgorithmParsedFlow, Graph, Node, ParsedFlow, Path, Splitters, UserFlowObject } from '@parser/types'
import { removeProp } from '@jstream/utils'
import { savedProps } from '@parser/constants'
import { buildErrorString } from '@parser/error-messages'

export const findNodeIndex = (splitter: Splitters) => (graph: Graph) => (displayName: string) => {
  const { partialPath } = distractDisplayNameBySplitters(splitter, displayName)
  const exactNode = graph.findIndex(({ path }) => arePathsEqual(partialPath, path))
  return exactNode > -1 ? exactNode : graph.findIndex(({ path }) => isSubsetOf(partialPath, path))
}

export const distractDisplayNameBySplitters = (splitters: Splitters, displayName: string): { partialPath: Path } => ({
  partialPath: displayName.split(splitters.extends),
})

export const extractUniqueFlowsNamesFromGraph = (splitters: Splitters) =>
  function extract(graph: string | string[]): string[] {
    if (!Array.isArray(graph)) {
      return extract([graph])
    }
    const result = graph.flatMap(subGraph => {
      const savedWords = [',', ':', '[', ']'].map(_escapeRegExp).join('|')
      const regex = new RegExp(savedWords, 'g')
      const displayNames = subGraph.split(regex)
      return displayNames
        .map(displayName => {
          const { partialPath } = distractDisplayNameBySplitters(splitters, displayName)
          return partialPath[0]
        })
        .filter(displayName => displayName.length > 0)
    })
    return [...new Set(result)]
  }

export type GraphNodeToDisplayName = (splitters: Splitters) => (flowNode: { path: Path }) => string
export const graphNodeToDisplayName: GraphNodeToDisplayName = splitters => flowNode => {
  if (flowNode.path.length === 1) {
    return flowNode.path[0]
  }
  return flowNode.path.join(splitters.extends)
}

export const displayNameToFullGraphNode = (splitters: Splitters) =>
  function<Extensions>({
    flowToParse,
    parsedFlows,
    ...rest
  }: {
    parsedFlows: ParsedFlow<Extensions>[]
    flowToParse: { name: string }
  } & ({} | { extendedParsedFlow: ParsedFlow<Extensions> })) {
    return (displayName: string): { path: Path } => {
      const { partialPath } = distractDisplayNameBySplitters(splitters, displayName)
      const path = fillUserPath({
        parsedFlows,
        flowName: flowToParse.name,
        ...('extendedParsedFlow' in rest && { extendedParsedFlow: rest.extendedParsedFlow }),
        userPath: partialPath,
      })
      return {
        path,
      }
    }
  }

export function excludeExtendedFlows<Extensions>(path: Path, extendedParsedFlow?: ParsedFlow<Extensions>) {
  return extendedParsedFlow
    ? path.filter(flowName => !extendedParsedFlow.graph.some(node => node.path.includes(flowName)))
    : path
}

function onlyIncludeExtendedFlows<Extensions>(path: Path, extendedParsedFlow?: ParsedFlow<Extensions>) {
  return extendedParsedFlow
    ? path.filter(flowName => extendedParsedFlow.graph.some(node => node.path.includes(flowName)))
    : []
}

function fillUserPath<Extensions>({
  parsedFlows,
  flowName,
  extendedParsedFlow,
  userPath,
}: {
  parsedFlows: AlgorithmParsedFlow<Extensions>[]
  flowName?: string
  extendedParsedFlow?: AlgorithmParsedFlow<Extensions>
  userPath: Path
}) {
  let newPath = flowName ? [flowName] : []
  const filteredUserPath = userPath[0] === flowName ? userPath.slice(1) : userPath

  const subPathNotExtendedFlows = excludeExtendedFlows(filteredUserPath, extendedParsedFlow)
  const subPathExtendedFlows = onlyIncludeExtendedFlows(filteredUserPath, extendedParsedFlow)

  if (subPathNotExtendedFlows.length > 0) {
    const parsedFlow = parsedFlows.find(
      parsedFlow => parsedFlow.name === subPathNotExtendedFlows[0],
    ) as AlgorithmParsedFlow<Extensions>

    const isExtendingTheSameFlow = (() => {
      if (extendedParsedFlow) {
        const extended = 'extendedParsedFlow' in parsedFlow && parsedFlow.extendedParsedFlow
        // TODO: Critical BUG!!!! fast solution: replaced while(extended) => if(extended)
        if (extended) {
          if (extended.name === extendedParsedFlow.name) {
            return true
          }
        }
      }
      return false
    })()
    const userPath = isExtendingTheSameFlow ? filteredUserPath : subPathNotExtendedFlows
    const options = parsedFlow.graph.map(node => node.path).filter(path => isSubsetOf(userPath, path))
    if (options.length === 1) {
      newPath = newPath.concat(options[0])
    } else {
      // else: options.length > 10
      const parsedFlowWithDefaultNodeIndex = parsedFlow as AlgorithmParsedFlow<Extensions> & {
        defaultNodeIndex: number
      }
      if (isSubsetOf(userPath, parsedFlow.graph[parsedFlowWithDefaultNodeIndex.defaultNodeIndex].path)) {
        newPath = newPath.concat(parsedFlow.graph[parsedFlowWithDefaultNodeIndex.defaultNodeIndex].path)
      } else {
        const lastParsedFlow = parsedFlows.find(
          parsedFlow => parsedFlow.name === userPath[userPath.length - 1],
        ) as AlgorithmParsedFlow<Extensions> & { defaultNodeIndex: number }
        const option = options.find(path =>
          isSubsetOf(lastParsedFlow.graph[lastParsedFlow.defaultNodeIndex as number].path, path),
        ) as Path
        newPath = newPath.concat(option)
      }
    }

    if (isExtendingTheSameFlow) {
      return newPath
    }
  }

  if (extendedParsedFlow) {
    const options = extendedParsedFlow.graph
      .map(node => node.path)
      .filter(path => isSubsetOf(subPathExtendedFlows, path))
    if (options.length === 1) {
      newPath = newPath.concat(options[0])
    } else {
      const parsedFlowWithDefaultNodeIndex = extendedParsedFlow as AlgorithmParsedFlow<Extensions> & {
        defaultNodeIndex: number
      }
      newPath = newPath.concat(extendedParsedFlow.graph[parsedFlowWithDefaultNodeIndex.defaultNodeIndex].path)
    }
  }

  return newPath
}

export function isSubsetOf(subsetPath: Path, fullPath: Path) {
  let i = 0,
    j = 0
  while (i <= j && i < subsetPath.length && j < fullPath.length) {
    if (subsetPath[i] === fullPath[j]) {
      i++
      j++
    } else {
      j++
    }
  }
  return i === subsetPath.length
}

export const arePathsEqual = (path1: Path, path2: Path) => {
  if (path1.length !== path2.length) {
    return false
  }
  for (let i = 0; i < path1.length; i++) {
    if (path1[i] !== path2[i]) {
      return false
    }
  }
  return true
}

// - the graph parameter don't have to be fully parsed graph. but every node must have a full path.
export function getHeadsIndexOfSubFlows<Extensions>({
  parsedFlows,
  flowToParse,
  graph,
  extendedParsedFlow,
}: {
  parsedFlows: ParsedFlow<Extensions>[]
  flowToParse: UserFlowObject<Extensions>
  graph: Graph
  extendedParsedFlow?: AlgorithmParsedFlow<Extensions>
}): number[] {
  function isHead(node: Node) {
    if (node.path.length === 1) {
      return true
    }

    const path = node.path.slice(1)

    if (!extendedParsedFlow) {
      const subFlow = parsedFlows.find(flow => flow.name === path[0]) as ParsedFlow<Extensions>
      return arePathsEqual(subFlow.graph[0].path, path)
    } else {
      const extendedFlowNameIndex = path.findIndex(flowName => flowName === extendedParsedFlow.name)
      if (extendedFlowNameIndex === 0) {
        return arePathsEqual(extendedParsedFlow.graph[0].path, path)
      }

      const subFlow = parsedFlows.find(flow => flow.name === path[0]) as ParsedFlow<Extensions>

      if (!subFlow.graph[0].path.every((flowName, i) => path[i] === flowName)) {
        return false
      }

      const startExtendIndex = path.findIndex((flowName, i) => subFlow.graph[0].path[i] !== flowName)

      if (startExtendIndex === -1) {
        return true
      }

      const extendedSubPath = path.slice(startExtendIndex)
      return arePathsEqual(extendedParsedFlow.graph[0].path, extendedSubPath)
    }
  }

  return graph.reduce((acc: number[], node, i) => (isHead(node) ? [...acc, i] : acc), [])
}

export const removeSavedProps = <T extends { [prop: string]: any }>(obj: T, throwError?: boolean): T => {
  if (throwError) {
    const existingSavedProps = Object.keys(obj).filter(savedProps.includes.bind(savedProps))
    if (existingSavedProps.length > 0) {
      throw new Error(
        buildErrorString({
          errorMessageKey: 'overriding parser properties is not allowed',
          additionalDetails: `you used those keys: [${existingSavedProps.join(
            ', ',
          )}]. these keys can't be used: [${savedProps.join(', ')}]`,
        }),
      )
    }
  }
  return removeProp(obj, ...savedProps)
}
