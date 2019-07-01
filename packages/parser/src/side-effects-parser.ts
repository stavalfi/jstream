import { displayNameToFullGraphNode } from '@parser/utils'
import { ParsedFlow, SideEffect, Splitters, UserSideEffects } from '@parser/types'

type ParseSideEffects = (
  splitters: Splitters,
) => ({
  parsedFlowsUntilNow,
  extendedParsedFlow,
  flowName,
  sideEffects,
}: {
  parsedFlowsUntilNow: ParsedFlow[]
  extendedParsedFlow?: ParsedFlow
  flowName?: string
  sideEffects?: UserSideEffects
}) => SideEffect[]

export const parseSideEffects: ParseSideEffects = splitters => ({
  parsedFlowsUntilNow,
  extendedParsedFlow,
  flowName,
  sideEffects = [],
}) => {
  const toNode = displayNameToFullGraphNode(splitters)({
    parsedFlows: parsedFlowsUntilNow,
    flowName,
    extendedParsedFlow,
  })
  return sideEffects.map(({ node_name, side_effect }) => {
    return {
      node: toNode(node_name),
      sideEffectFunc: side_effect,
    }
  })
}
