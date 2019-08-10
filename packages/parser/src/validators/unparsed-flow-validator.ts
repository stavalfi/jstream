import { extractUniqueFlowsNamesFromGraph } from '@parser/utils'
import { ParsedFlow, ParsedUserFlow, Splitters } from '@parser/types'
import { composeErrors, ErrorObject, unParsedFlowErrorObject } from '@parser/error-messages'
import { toArray } from '@jstream/utils'

export const validateFlowToParse = (splitters: Splitters) => (
  parsedFlowsUntilNow: ParsedFlow[],
  extendedParsedFlow?: ParsedFlow,
) => (flowToParse: ParsedUserFlow) => {
  const errorObjects = buildErrorObjects(splitters)(parsedFlowsUntilNow, extendedParsedFlow)(flowToParse)
  if (errorObjects.length > 0) {
    throw new Error(composeErrors(...errorObjects))
  }
  return flowToParse
}

const buildErrorObjects = (splitters: Splitters) => (
  parsedFlowsUntilNow: ParsedFlow[],
  extendedParsedFlow?: ParsedFlow,
) => (flowToParse: ParsedUserFlow): ErrorObject[] => {
  const errorObjects: ErrorObject[] = []

  if (Object.keys(flowToParse).length === 0) {
    errorObjects.push({
      errorMessageKey: 'flow has no properties',
    })
    return errorObjects
  }

  if ('name' in flowToParse) {
    if (!flowToParse.name) {
      errorObjects.push(
        unParsedFlowErrorObject({
          errorMessageKey: `flow-name can't be falsy`,
          flowToParse,
        }),
      )
    } else {
      if (parsedFlowsUntilNow.some(flow => 'name' in flow && flow.name === flowToParse.name)) {
        errorObjects.push(
          unParsedFlowErrorObject({
            errorMessageKey: `flow with the same name is already defined`,
            flowToParse,
          }),
        )
      }
      const includedDelimiter = Object.values(splitters).find(delimiter => flowToParse.name.includes(delimiter))
      if (includedDelimiter) {
        errorObjects.push(
          unParsedFlowErrorObject({
            errorMessageKey: `flow-name can't contain a splitter`,
            flowToParse,
          }),
        )
      }
    }
  } else {
    if (flowToParse.extendsFlows.filter(Boolean).length > 0) {
      errorObjects.push(
        unParsedFlowErrorObject({
          errorMessageKey: `flow with extended-flows property must have a name`,
          flowToParse,
        }),
      )
    }
  }

  if ('graph' in flowToParse) {
    const graph = toArray(flowToParse.graph)
    if (graph.length === 0 || graph.filter(Boolean).length !== graph.length) {
      errorObjects.push(
        unParsedFlowErrorObject({
          errorMessageKey: `illegal unparsed-graph`,
          flowToParse,
        }),
      )
    } else {
      const flows = extractUniqueFlowsNamesFromGraph(splitters)(graph)
      if (flows.length === 1 && 'defaultPath' in flowToParse) {
        errorObjects.push(
          unParsedFlowErrorObject({
            errorMessageKey: "a flow's graph with a single node can't have a defaultPath property",
            flowToParse,
          }),
        )
      }
    }
  }

  return errorObjects
}
