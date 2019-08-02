import { ParsedUserFlow, UserFlow } from '@parser/types'
import { Combinations } from '@jstream/utils'

type ErrorMessages = {
  [errorMessageKey: string]: {
    errorCode: string
    additionalExplanation: string
  }
}

export const errorMessages: ErrorMessages = {}

type BuildErrorString = (
  params: {
    errorMessageKey: keyof typeof errorMessages
    printDevError?: boolean
  } & Combinations<{ error: any; additionalDetails: string }>,
) => string

export const buildErrorString: BuildErrorString = ({ errorMessageKey, printDevError = __DEV__, ...rest }) => {
  const error = 'error' in rest && rest.error
  const additionalDetails = 'additionalDetails' in rest && rest.additionalDetails
  const additionalExplanation = errorMessages[errorMessageKey].additionalExplanation
  return `Error code: ${errorMessages[errorMessageKey].errorCode}\n${errorMessageKey}\n${
    additionalDetails ? `${additionalDetails}\n` : ''
  }${additionalExplanation ? `additional-explanation: ${additionalExplanation}\n` : ''}${error ? `${error}\n` : ''}`
}

type UserFlowError = (
  params: {
    flow: ParsedUserFlow | UserFlow
    errorMessageKey: keyof typeof errorMessages
    printDevError?: boolean
  } & Combinations<{ error: any; additionalDetails: any }>,
) => string

export const userFlowError: UserFlowError = ({ flow, ...rest }) => {
  const flowName = flow && typeof flow === 'object' && 'name' in flow ? flow.name : 'NO_NAME'
  const graph = flow && (typeof flow === 'string' ? flow : Array.isArray(flow) ? flow.join(', ') : flow.graph)
  const additionalDetails = 'additionalDetails' in rest && rest.additionalDetails
  return buildErrorString({
    ...rest,
    additionalDetails: `flow-name: ${flowName}\nunparsed-graph: ${graph}\n${
      additionalDetails ? `additional-details: ${additionalDetails}\n` : ''
    }`,
  })
}
