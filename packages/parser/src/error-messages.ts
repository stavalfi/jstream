import { Combinations, toArray } from '@jstream/utils'
import { ParsedUserFlow } from '@parser/types'

export const errorMessages = {
  'flow has no properties': {
    errorCode: 'pa-1',
    additionalExplanation:
      'please check that you didnt pass an empty object to an array inside the configuration object',
  },
  [`flow-name can't be falsy`]: {
    errorCode: 'pa-2',
  },
  [`flow with the same name is already defined`]: {
    errorCode: 'pa-3',
  },
  [`flow-name can't contain a splitter`]: {
    errorCode: 'pa-4',
    additionalExplanation: `If you didn't define any splitter by your self, you may have used the default splitter which is: /`,
  },
  [`flow with extended-flows property must have a name`]: {
    errorCode: 'pa-5',
  },
  [`illegal unparsed-graph`]: {
    errorCode: 'pa-6',
    additionalExplanation: `you must have a graph and it can't be empty string or empty array or an array with falsy values`,
  },
  [`a flow's graph with a single node can't have a defaultPath property`]: {
    errorCode: 'pa-7',
    additionalExplanation:
      'we may remove this error in the future. its too expensive in production to partially check how much nodes there are in an unparsed-graph.',
  },
}

const buildString = (...str: (string | false | null | undefined)[]): string => str.filter(Boolean).join(`\n`)

export type ErrorObject = {
  errorMessageKey: keyof typeof errorMessages
  printDevError?: boolean
} & Combinations<{ error: any; additionalDetails: string }>

type BuildErrorString = (params: ErrorObject) => string

export const buildErrorString: BuildErrorString = ({ errorMessageKey, printDevError = __DEV__, ...rest }) => {
  const errorMessage = errorMessages[errorMessageKey]
  const additionalExplanation = 'additionalExplanation' in errorMessage && errorMessage.additionalExplanation

  return buildString(
    `Error code: ${errorMessage.errorCode}`,
    errorMessageKey,
    'additionalDetails' in rest && rest.additionalDetails,
    additionalExplanation && `additional-explanation: ${additionalExplanation}`,
    'error' in rest && rest.error,
  )
}

export const composeErrors = (...errors: ErrorObject[]): string => errors.map(buildErrorString).join(`\n-----------\n`)

export const unParsedFlowErrorObject = ({
  flowToParse,
  ...errorObject
}: ErrorObject & { flowToParse: ParsedUserFlow }) => ({
  ...errorObject,
  additionalDetails: buildString(
    'name' in flowToParse && `flow-name: ${flowToParse.name}`,
    `user-graph: [${toArray(flowToParse.graph).join(' &&& ')}]`,
    'defaultPath' in flowToParse && `default-path: ${flowToParse.defaultPath}`,
    ' ',
    'additionalDetails' in errorObject && errorObject.additionalDetails,
  ),
})
