import { displayNameToFullGraphNode } from '@parser/utils'
import { ParsedFlow, ParsedUserFlow, Path, Rule, Splitters } from '@parser/types'

type ParseRules = (
  splitters: Splitters,
) => ({
  parsedFlowsUntilNow,
  extendedParsedFlow,
  flowToParse,
}: {
  parsedFlowsUntilNow: ParsedFlow[]
  extendedParsedFlow?: ParsedFlow
  flowToParse: ParsedUserFlow
}) => Rule<{ node: { path: Path } }>[]

export const parseRules: ParseRules = splitters => ({ parsedFlowsUntilNow, extendedParsedFlow, flowToParse }) => {
  const toNode = displayNameToFullGraphNode(splitters)({
    parsedFlows: parsedFlowsUntilNow,
    flowToParse,
    extendedParsedFlow,
  })
  const rules = 'rules' in flowToParse ? flowToParse.rules : []
  return rules.map(rule => {
    return {
      ...('node_name' in rule && { node: toNode(rule.node_name) }),
      ...rule,
    }
  })
}
