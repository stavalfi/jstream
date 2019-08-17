import { AlgorithmParsedFlow, ParsedFlow, Splitters, UserFlow, UserFlowObject, UserGraph } from '@parser/types'
import { buildString, composeErrors, ErrorObject } from '@parser/error-messages'
import { Combinations } from '@utils/types'
import { toArray } from '@utils/utils'

export const validateUserFlow = (splitters: Splitters) => (
  parsedFlowsUntilNow: ParsedFlow[],
  extendedParsedFlow?: AlgorithmParsedFlow,
) => (useFlow: UserFlow) => {
  const errorObjects = buildErrorObjects(splitters)(parsedFlowsUntilNow, extendedParsedFlow)(useFlow)
  if (errorObjects.length > 0) {
    throw new Error(composeErrors(...errorObjects))
  }
  return useFlow
}

function userFlowErrorObject({
  useFlow,
  ...errorObject
}: ErrorObject & { useFlow: UserFlow } & Combinations<{
    name: string
    graph: UserGraph
  }>): ErrorObject {
  return {
    ...errorObject,
    additionalDetails: buildString(
      `flow: ${useFlow}`,
      'name' in errorObject && `flow-name: ${errorObject.name}`,
      'graph' in errorObject && `user-graph: [${toArray(errorObject.graph).join(' &&& ')}]`,
      ' ',
      'additionalDetails' in errorObject && errorObject.additionalDetails,
    ),
  }
}

const buildErrorObjects = (splitters: Splitters) => (
  parsedFlowsUntilNow: ParsedFlow[],
  extendedParsedFlow?: AlgorithmParsedFlow,
) =>
  function validate(
    originalUseFlow: UserFlow,
    userFlow?: UserFlowObject,
    errorObjects: ErrorObject[] = [],
  ): ErrorObject[] {
    if (!userFlow && typeof originalUseFlow === 'string') {
      return validate(
        originalUseFlow,
        {
          graph: [originalUseFlow],
        },
        errorObjects,
      )
    }

    if (!userFlow && Array.isArray(originalUseFlow)) {
      return validate(
        originalUseFlow,
        {
          graph: originalUseFlow,
        },
        errorObjects,
      )
    }

    if (typeof originalUseFlow === 'object' && 'name' in originalUseFlow) {
      if (parsedFlowsUntilNow.some(f => 'name' in f && f.name === originalUseFlow.name)) {
        errorObjects.push(
          userFlowErrorObject({
            errorMessageKey: 'flow with the same name is already defined',
            useFlow: originalUseFlow,
            name: originalUseFlow.name,
            graph: originalUseFlow.graph,
          }),
        )
      }

      let extended: AlgorithmParsedFlow | undefined | false = extendedParsedFlow
      let level = 1
      while (extended) {
        if ('name' in extended && extended.name === originalUseFlow.name) {
          errorObjects.push(
            userFlowErrorObject({
              errorMessageKey: 'flow with the same name is already defined in an extended flow',
              useFlow: originalUseFlow,
              name: originalUseFlow.name,
              graph: originalUseFlow.graph,
              additionalDetails: `you already defined this flow explicitly ${level} above this flow`,
            }),
          )
        }
        level++
        extended = 'extendedParsedFlow' in extended && extended.extendedParsedFlow
      }
    }

    return errorObjects
  }
