import _escapeRegExp from 'lodash/escapeRegExp'
import { AlgorithmParsedFlow, Node, ParsedFlow, Path, Splitters } from '@parser/types'

export const distractDisplayNameBySplitters = (
  splitters: Splitters,
  displayName: string,
): { partialPath: Path; identifier?: string } => {
  const identifierSplitterStartIndex = splitters.identifier ? displayName.indexOf(splitters.identifier) : -1

  const identifierObject = splitters.hasOwnProperty('identifier') &&
    identifierSplitterStartIndex > -1 && {
      identifier: displayName.split(splitters.identifier as string)[1],
    }

  const displayNameOnlyFlows =
    identifierSplitterStartIndex > -1 ? displayName.slice(0, identifierSplitterStartIndex) : displayName

  const partialPath = displayNameOnlyFlows.split(splitters.extends)

  return {
    partialPath,
    ...identifierObject,
  }
}

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

export type GraphNodeToDisplayName = (splitters: Splitters) => (flowNode: Node) => string
export const graphNodeToDisplayName: GraphNodeToDisplayName = splitters => flowNode => {
  if (flowNode.path.length === 1) {
    return flowNode.path[0]
  }
  const flows = flowNode.path.join(splitters.extends)
  if (flowNode.identifier) {
    return `${flows}${splitters.identifier}${flowNode.identifier}`
  } else {
    return flows
  }
}

export type DisplayNameToFullGraphNode = (
  splitters: Splitters,
) => (
  params: {
    parsedFlows: ParsedFlow[]
  } & (
    | {}
    | { flowName: string }
    | { extendedParsedFlow: ParsedFlow }
    | { flowName: string; extendedParsedFlow: ParsedFlow }),
) => (displayName: string) => { path: Path; identifier?: string }

export const displayNameToFullGraphNode: DisplayNameToFullGraphNode = splitters => params => displayName => {
  const { partialPath, identifier } = distractDisplayNameBySplitters(splitters, displayName)
  const path = fillUserPath({
    parsedFlows: params.parsedFlows,
    ...('flowName' in params && { flowName: params.flowName }),
    ...('extendedParsedFlow' in params && { extendedParsedFlow: params.extendedParsedFlow }),
    userPath: partialPath,
  })
  return {
    path,
    ...(identifier && { identifier }),
  }
}

export const excludeExtendedFlows = (path: Path, extendedParsedFlow?: ParsedFlow) =>
  extendedParsedFlow
    ? path.filter(flowName => !extendedParsedFlow.graph.some(node => node.path.includes(flowName)))
    : path

const onlyIncludeExtendedFlows = (path: Path, extendedParsedFlow?: ParsedFlow) =>
  extendedParsedFlow ? path.filter(flowName => extendedParsedFlow.graph.some(node => node.path.includes(flowName))) : []

function fillUserPath({
  parsedFlows,
  flowName,
  extendedParsedFlow,
  userPath,
}: {
  parsedFlows: AlgorithmParsedFlow[]
  flowName?: string
  extendedParsedFlow?: AlgorithmParsedFlow
  userPath: Path
}) {
  let newPath = flowName ? [flowName] : []
  const filteredUserPath = userPath[0] === flowName ? userPath.slice(1) : userPath

  const subPathNotExtendedFlows = excludeExtendedFlows(filteredUserPath, extendedParsedFlow)
  const subPathExtendedFlows = onlyIncludeExtendedFlows(filteredUserPath, extendedParsedFlow)

  if (subPathNotExtendedFlows.length > 0) {
    const parsedFlow = parsedFlows.find(
      parsedFlow => 'name' in parsedFlow && parsedFlow.name === subPathNotExtendedFlows[0],
    ) as AlgorithmParsedFlow

    const isExtendingTheSameFlow = (() => {
      if (extendedParsedFlow) {
        const extended = 'extendedParsedFlow' in parsedFlow && parsedFlow.extendedParsedFlow
        // TODO: Critical BUG!!!! fast solution: replaced while(extended) => if(extended)
        if (extended) {
          if ('name' in extended && 'name' in extendedParsedFlow && extended.name === extendedParsedFlow.name) {
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
      const parsedFlowWithDefaultNodeIndex = parsedFlow as AlgorithmParsedFlow & { defaultNodeIndex: number }
      if (isSubsetOf(userPath, parsedFlow.graph[parsedFlowWithDefaultNodeIndex.defaultNodeIndex].path)) {
        newPath = newPath.concat(parsedFlow.graph[parsedFlowWithDefaultNodeIndex.defaultNodeIndex].path)
      } else {
        const lastParsedFlow = parsedFlows.find(
          parsedFlow => 'name' in parsedFlow && parsedFlow.name === userPath[userPath.length - 1],
        ) as AlgorithmParsedFlow & { defaultNodeIndex: number }
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
      const parsedFlowWithDefaultNodeIndex = extendedParsedFlow as AlgorithmParsedFlow & { defaultNodeIndex: number }
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
