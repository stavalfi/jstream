import { extractUniqueFlowsNamesFromGraph } from '@parser/utils'
import { ParsedFlow, ParsedUserFlow, Splitters } from '@parser/types'
import { buildString, composeErrors, ErrorObject } from '@parser/error-messages'
import { toArray } from '@jstream/utils'

export const validateParsedUserFlow = (splitters: Splitters) => (
  parsedFlowsUntilNow: ParsedFlow[],
  extendedParsedFlow?: ParsedFlow,
) => (flowToParse: ParsedUserFlow) => {
  const errorObjects = buildErrorObjects(splitters)(parsedFlowsUntilNow, extendedParsedFlow)(flowToParse)
  if (errorObjects.length > 0) {
    throw new Error(composeErrors(...errorObjects))
  }
  return flowToParse
}

const unParsedFlowErrorObject = ({
  flowToParse,
  ...errorObject
}: ErrorObject & { flowToParse: ParsedUserFlow }): ErrorObject => ({
  ...errorObject,
  additionalDetails: buildString(
    'name' in flowToParse && `flow-name: ${flowToParse.name}`,
    `user-graph: [${toArray(flowToParse.graph).join(' &&& ')}]`,
    'defaultPath' in flowToParse && `default-path: ${flowToParse.defaultPath}`,
    ' ',
    'additionalDetails' in errorObject && errorObject.additionalDetails,
  ),
})

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
      const includedDelimiter = flowToParse.name.includes(splitters.extends)
      if (includedDelimiter) {
        errorObjects.push(
          unParsedFlowErrorObject({
            errorMessageKey: `flow-name can't contain a splitter`,
            flowToParse,
          }),
        )
      }

      if (extendedParsedFlow && 'name' in extendedParsedFlow && flowToParse.name === extendedParsedFlow.name) {
        errorObjects.push(
          unParsedFlowErrorObject({
            errorMessageKey: `using the name of the extends flow inside a graph is not allowed`,
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
