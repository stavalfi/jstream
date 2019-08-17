import { AlgorithmParsedFlow, ParsedFlow, Splitters, UserFlow, UserFlowObject, UserGraph } from '@parser/types'
import { buildString, composeErrors, ErrorObject } from '@parser/error-messages'
import { Combinations } from '@utils/types'
import { toArray } from '@utils/utils'
import { extractUniqueFlowsNamesFromGraph } from '@parser/utils'

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
) => (originalUseFlow: UserFlow, errorObjects: ErrorObject[] = []): ErrorObject[] => {
  if (typeof originalUseFlow === 'string') {
    return build(splitters)(parsedFlowsUntilNow, extendedParsedFlow)(
      originalUseFlow,
      {
        graph: [originalUseFlow],
      },
      errorObjects,
    )
  }

  if (Array.isArray(originalUseFlow)) {
    return build(splitters)(parsedFlowsUntilNow, extendedParsedFlow)(
      originalUseFlow,
      {
        graph: originalUseFlow,
      },
      errorObjects,
    )
  }

  return build(splitters)(parsedFlowsUntilNow, extendedParsedFlow)(originalUseFlow, originalUseFlow, errorObjects)
}

const build = (splitters: Splitters) => (
  parsedFlowsUntilNow: ParsedFlow[],
  extendedParsedFlow?: AlgorithmParsedFlow,
) => (originalUseFlow: UserFlow, userFlowObject: UserFlowObject, errorObjects: ErrorObject[] = []): ErrorObject[] => {
  const flowNames = extractUniqueFlowsNamesFromGraph(splitters)(userFlowObject.graph)

  const extendedFlows = ((): AlgorithmParsedFlow[] => {
    const flows: AlgorithmParsedFlow[] = []
    let extended: AlgorithmParsedFlow | undefined | false = extendedParsedFlow
    while (extended) {
      flows.push(extended)
      extended = 'extendedParsedFlow' in extended && extended.extendedParsedFlow
    }
    return flows
  })()

  const usedExtendedFlow = extendedFlows.find(f => 'name' in f && flowNames.includes(f.name))

  if (usedExtendedFlow) {
    errorObjects.push(
      userFlowErrorObject({
        errorMessageKey: `using the name of the extends flow inside a graph is not allowed`,
        useFlow: originalUseFlow,
        ...('name' in userFlowObject && { name: userFlowObject.name }),
        graph: userFlowObject.graph,
        additionalDetails: `you used this extended flow: ${userFlowObject}`,
      }),
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

    const level = extendedFlows.findIndex(f => 'name' in f && f.name === originalUseFlow.name)
    if (level > -1) {
      errorObjects.push(
        userFlowErrorObject({
          errorMessageKey: 'flow with the same name is already defined as an extended flow',
          useFlow: originalUseFlow,
          name: originalUseFlow.name,
          graph: originalUseFlow.graph,
          additionalDetails: `you already defined this flow explicitly ${level + 1} above this flow`,
        }),
      )
    }
  }

  return errorObjects
}
