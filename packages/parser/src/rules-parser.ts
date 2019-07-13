import { displayNameToFullGraphNode } from '@parser/utils'
import { ParsedFlow, Path, Rule, Splitters } from '@parser/types'

type ParseRules = (
  splitters: Splitters,
) => ({
  parsedFlowsUntilNow,
  extendedParsedFlow,
  flowName,
  rules,
}: {
  parsedFlowsUntilNow: ParsedFlow[]
  extendedParsedFlow?: ParsedFlow
  flowName?: string
  rules?: Rule<{ node_name: string }>[]
}) => Rule<{ node: { path: Path } }>[]

export const parseRules: ParseRules = splitters => ({
  parsedFlowsUntilNow,
  extendedParsedFlow,
  flowName,
  rules = [],
}) => {
  const toNode = displayNameToFullGraphNode(splitters)({
    parsedFlows: parsedFlowsUntilNow,
    flowName,
    extendedParsedFlow,
  })
  return rules.map(rule => {
    return {
      ...('node_name' in rule && { node: toNode(rule.node_name) }),
      ...rule,
    }
  })
}
