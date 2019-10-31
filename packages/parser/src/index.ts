import { parseMultipleFlows } from '@parser/flows-parser'
import {
  Graph,
  PathsGroups,
  AlgorithmParsedFlow,
  ParsedFlow,
  UserFlow,
  ParsedUserFlow,
  Splitters,
  UserFlowObject,
  Node,
  UserGraph,
  Path,
  UserConfiguration,
  BaseParsedFlow,
  Configuration,
  ParsedFlowOptionalFields,
  ParseExtensionsProps,
} from '@parser/types'
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

export type Graph = Graph
export type PathsGroups = PathsGroups
export type AlgorithmParsedFlow<T> = AlgorithmParsedFlow<T>
export type ParsedFlow<T> = ParsedFlow<T>
export type UserFlow<T> = UserFlow<T>
export type ParsedUserFlow<T> = ParsedUserFlow<T>
export type Splitters = Splitters
export type UserFlowObject<T> = UserFlowObject<T>
export type Node = Node
export type UserGraph = UserGraph
export type Path = Path
export type UserConfiguration<T> = UserConfiguration<T>
export type BaseParsedFlow<T> = BaseParsedFlow<T>
export type Configuration<T> = Configuration<T>
export type ParsedFlowOptionalFields = ParsedFlowOptionalFields
export type ParseExtensionsProps<T, U> = ParseExtensionsProps<T, U>
