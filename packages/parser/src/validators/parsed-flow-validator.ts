import { ParsedFlow, ParsedUserFlow, Splitters, UserFlow } from '@parser/types'
import { buildString, composeErrors, ErrorObject } from '@parser/error-messages'

export const validateParsedFlow = (splitters: Splitters) => ({
  userFlow,
  parsedUserFlow,
  flows,
}: {
  userFlow: UserFlow
  parsedUserFlow: ParsedUserFlow
  flows: ParsedFlow[]
}) => (flow: ParsedFlow) => {
  const errorObjects = buildErrorObjects(splitters)({ userFlow, parsedUserFlow, flows })(flow)
  if (errorObjects.length > 0) {
    throw new Error(composeErrors(...errorObjects))
  }
  return flow
}

function parsedFlowErrorObject({ flow, ...errorObject }: ErrorObject & { flow: ParsedFlow }): ErrorObject {
  return {
    ...errorObject,
    additionalDetails: buildString(
      'name' in flow && `flow-name: ${flow.name}`,
      ' ',
      'additionalDetails' in errorObject && errorObject.additionalDetails,
    ),
  }
}

const buildErrorObjects = (splitters: Splitters) => ({
  userFlow,
  parsedUserFlow,
  flows,
}: {
  userFlow: UserFlow
  parsedUserFlow: ParsedUserFlow
  flows: ParsedFlow[]
}) => (flow: ParsedFlow): ErrorObject[] => {
  const errorObjects: ErrorObject[] = []

  const otherFlows = flows.filter(f => f.id !== flow.id)

  return errorObjects
}
