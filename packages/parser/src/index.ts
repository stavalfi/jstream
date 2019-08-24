import { parseMultipleFlows } from '@parser/flows-parser'
import { ParsedFlow, ParseExtensionsProps, Splitters, UserConfiguration } from '@parser/types'
import initializeConfig from '@parser/configuration-shortcuts-parser'

export default function parse<UnparsedExtensions = {}, Extensions = {}>(
  userConfiguration: UserConfiguration<UnparsedExtensions>,
  parseExtensionsProps: ParseExtensionsProps<UnparsedExtensions, Extensions> = () => ({} as Extensions),
): {
  splitters: Splitters
  flows: ParsedFlow<Extensions>[]
} {
  const { splitters, userFlows } = initializeConfig(userConfiguration)
  return {
    splitters: splitters,
    flows: parseMultipleFlows({
      userFlows,
      splitters,
      parseExtensionsProps,
    }),
  }
}

export {
  graphNodeToDisplayName,
  isSubsetOf,
  displayNameToFullGraphNode,
  distractDisplayNameBySplitters,
  findNodeIndex,
  arePathsEqual,
} from '@parser/utils'
export * from '@parser/types'
