import { displayNameToFullGraphNode } from '@parser/utils'
import { ParsedFlow, ParsedUserFlow, SideEffect, Splitters } from '@parser/types'

type ParseSideEffects = (
  splitters: Splitters,
) => ({
  parsedFlowsUntilNow,
  extendedParsedFlow,
  flowToParse,
}: {
  parsedFlowsUntilNow: ParsedFlow[]
  extendedParsedFlow?: ParsedFlow
  flowToParse: ParsedUserFlow
}) => SideEffect[]

export const parseSideEffects: ParseSideEffects = splitters => ({
  parsedFlowsUntilNow,
  extendedParsedFlow,
  flowToParse,
}) => {
  const toNode = displayNameToFullGraphNode(splitters)({
    parsedFlows: parsedFlowsUntilNow,
    flowToParse,
    extendedParsedFlow,
  })
  const sideEffects = 'side_effects' in flowToParse ? flowToParse.side_effects : []
  return sideEffects.map(sideEffect => ({
    ...('node_name' in sideEffect && { node: toNode(sideEffect.node_name) }),
    sideEffectFunc: sideEffect.side_effect,
  }))
}
