import { extractUniqueFlowsNamesFromGraph } from 'utils'
import { ParsedFlow, ParsedUserFlow, Splitters } from 'types'

export const validateFlowToParse = (splitters: Splitters) => (
  parsedFlowsUntilNow: ParsedFlow[],
  extendedParsedFlow?: ParsedFlow,
) => (flowToParse: ParsedUserFlow) => {
  if (Object.keys(flowToParse).length === 0) {
    throw new Error("flow can't have zero properties.")
  }

  if (flowToParse.graph) {
    if (Array.isArray(flowToParse.graph) && flowToParse.graph.length === 0) {
      throw new Error(
        `graph can't be an empty array. it must be a string or an array with at least 
        one string which represents the actual graph.`,
      )
    }
    const flows = extractUniqueFlowsNamesFromGraph(splitters)(flowToParse.graph)
    if (flows.length === 0) {
      throw new Error("flow can't have zero flows in his graph.")
    }
    if (flows.length === 1) {
      if (flowToParse.defaultFlowName) {
        throw new Error(`flow with a graph containing a single 
        flow can't have a default_flow_name property.`)
      }
      return flowToParse
    }
    if (!flowToParse.extendsFlows || flowToParse.extendsFlows.length === 0) {
      return flowToParse
    }
    if (flows.length > 1) {
      if (flowToParse.name) {
        if (flows.includes(flowToParse.name)) {
          throw new Error(
            `flow with multiple flows in his graph, can't have a 
          name that exists in his graph as one of the flows there. 
          it indicates that there is already a parsed flow with the same name.`,
          )
        }
      }
      return flowToParse
    } else {
      return flowToParse
    }
  } else {
    return flowToParse
  }
}
