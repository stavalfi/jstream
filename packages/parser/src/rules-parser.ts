import { findNodeIndex } from '@parser/utils'
import { Graph, ParsedUserFlow, Path, Rule, Splitters } from '@parser/types'

type ParseRules = (
  splitters: Splitters,
) => ({
  parsedGraph,
  flowToParse,
}: {
  parsedGraph: Graph
  flowToParse: ParsedUserFlow
}) => Rule<{ node: { path: Path } }>[]

export const parseRules: ParseRules = splitters => ({ parsedGraph, flowToParse }) => {
  const toNodeIndex = findNodeIndex(splitters)(parsedGraph)
  return flowToParse.rules.map(rule => {
    return {
      ...('node_name' in rule && { nodeIndex: toNodeIndex(rule.node_name) }),
      ...rule,
    }
  })
}
