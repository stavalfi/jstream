import { findNodeIndex } from '@parser/utils'
import { Graph, ParsedUserFlow, SideEffect, Splitters } from '@parser/types'

type ParseSideEffects = (
  splitters: Splitters,
) => ({ parsedGraph, flowToParse }: { parsedGraph: Graph; flowToParse: ParsedUserFlow }) => SideEffect[]

export const parseSideEffects: ParseSideEffects = splitters => ({ parsedGraph, flowToParse }) => {
  const toNodeIndex = findNodeIndex(splitters)(parsedGraph)
  return flowToParse.side_effects.map(sideEffect => ({
    ...('node_name' in sideEffect && { nodeIndex: toNodeIndex(sideEffect.node_name) }),
    sideEffectFunc: sideEffect.side_effect,
  }))
}
