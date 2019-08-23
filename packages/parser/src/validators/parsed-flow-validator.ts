import { ParsedFlow, ParsedUserFlow, Splitters, UserFlow } from '@parser/types'
import { composeErrors, ErrorObject } from '@parser/error-messages'

export const validateParsedFlow = (splitters: Splitters) =>
  function<UnparsedExtensions, Extensions>({
    userFlow,
    parsedUserFlow,
    flows,
  }: {
    userFlow: UserFlow<UnparsedExtensions>
    parsedUserFlow: ParsedUserFlow<UnparsedExtensions>
    flows: ParsedFlow<Extensions>[]
  }) {
    return (flow: ParsedFlow<Extensions>) => {
      const errorObjects = buildErrorObjects(splitters)({ userFlow, parsedUserFlow, flows })(flow)
      if (errorObjects.length > 0) {
        throw new Error(composeErrors(...errorObjects))
      }
      return flow
    }
  }

// function parsedFlowErrorObject({ flow, ...errorObject }: ErrorObject & { flow: ParsedFlow }): ErrorObject {
//   return {
//     ...errorObject,
//     additionalDetails: buildString(
//       'name' in flow && `flow-name: ${flow.name}`,
//       ' ',
//       'additionalDetails' in errorObject && errorObject.additionalDetails,
//     ),
//   }
// }

const buildErrorObjects = (splitters: Splitters) =>
  function<UnparsedExtensions, Extensions>({
    userFlow,
    parsedUserFlow,
    flows,
  }: {
    userFlow: UserFlow<UnparsedExtensions>
    parsedUserFlow: ParsedUserFlow<UnparsedExtensions>
    flows: ParsedFlow<Extensions>[]
  }) {
    return (flow: ParsedFlow<Extensions>): ErrorObject[] => {
      const errorObjects: ErrorObject[] = []

      return errorObjects
    }
  }
