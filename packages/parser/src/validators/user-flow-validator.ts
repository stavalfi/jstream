import { ParsedFlow, Splitters, UserFlow, UserGraph } from '@parser/types'
import { buildString, composeErrors, ErrorObject } from '@parser/error-messages'
import { Combinations, toArray } from '@jstream/utils'

export const validateUserFlow = (splitters: Splitters) => (
  parsedFlowsUntilNow: ParsedFlow[],
  extendedParsedFlow?: ParsedFlow,
) => (useFlow: UserFlow) => {
  const errorObjects = buildErrorObjects(splitters)(parsedFlowsUntilNow, extendedParsedFlow)(useFlow)
  if (errorObjects.length > 0) {
    throw new Error(composeErrors(...errorObjects))
  }
  return useFlow
}

const userFlowErrorObject = ({
  useFlow,
  ...errorObject
}: ErrorObject & { useFlow: UserFlow } & Combinations<{
    name: string
    graph: UserGraph
  }>): ErrorObject => ({
  ...errorObject,
  additionalDetails: buildString(
    `flow: ${useFlow}`,
    'name' in errorObject && `flow-name: ${errorObject.name}`,
    'graph' in errorObject && `user-graph: [${toArray(errorObject.graph).join(' &&& ')}]`,
    ' ',
    'additionalDetails' in errorObject && errorObject.additionalDetails,
  ),
})

const buildErrorObjects = (splitters: Splitters) => (
  parsedFlowsUntilNow: ParsedFlow[],
  extendedParsedFlow?: ParsedFlow,
) =>
  function validate(useFlow: UserFlow, errorObjects: ErrorObject[] = []): ErrorObject[] {
    if (typeof useFlow === 'string') {
      return validate(
        {
          graph: [useFlow],
        },
        errorObjects,
      )
    }

    if (Array.isArray(useFlow)) {
      return validate(
        {
          graph: useFlow,
        },
        errorObjects,
      )
    }

    return errorObjects
  }
