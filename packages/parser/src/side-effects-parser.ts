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
  let result: SideEffect[] = sideEffects.map(sideEffect => ({
    ...('node_name' in sideEffect && { node: toNode(sideEffect.node_name) }),
    sideEffectFunc: sideEffect.side_effect,
  }))
  return result
}
