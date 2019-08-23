export type Splitters = {
  extends: string
}

export type Path = string[]

export type Node = {
  path: Path
  childrenIndexes: number[]
  parentsIndexes: number[]
}

export type Graph = Node[]

export type ParsedFlowOptionalFields =
  | {}
  | {
      defaultNodeIndex: number
    }
  | {
      extendedFlowIndex: number
    }
  | {
      extendedFlowIndex: number
      defaultNodeIndex: number
    }

export type PathsGroups = string[][]

export type BaseParsedFlow<Extensions> = {
  id: string
  hasPredefinedName: boolean
  name: string
  graph: Graph
  pathsGroups: PathsGroups
} & Extensions

export type ParsedFlow<Extensions> = BaseParsedFlow<Extensions> & ParsedFlowOptionalFields

export type AlgorithmParsedFlow<Extensions> = BaseParsedFlow<Extensions> &
  ParsedFlowOptionalFields &
  (
    | {
        extendedFlowId: string
        extendedParsedFlow: AlgorithmParsedFlow<Extensions>
      }
    | {})

export type UserGraph = string | string[]

export type UserFlowObject<UnparsedExtensions> = {
  graph: UserGraph
} & (UnparsedExtensions | {}) &
  (
    | {}
    | { name: string }
    | { default_path: string }
    | { extends_flows: UserFlow<UnparsedExtensions>[] }
    | { name: string; default_path: string }
    | { default_path: string; extends_flows: UserFlow<UnparsedExtensions>[] }
    | { name: string; extends_flows: UserFlow<UnparsedExtensions>[] }
    | { name: string; default_path: string; extends_flows: UserFlow<UnparsedExtensions>[] })

export type UserFlow<UnparsedExtensions> = UserGraph | UserFlowObject<UnparsedExtensions>

export type ParsedUserFlow<UnparsedExtensions> = {
  hasPredefinedName: boolean
  name: string
  graph: string[]
  extendsFlows: UserFlow<UnparsedExtensions>[]
} & (UnparsedExtensions | {}) &
  ({} | { defaultPath: string[] })

export type Configuration<Flow> = {
  splitters?: Splitters
  flows: Flow[]
}

export type UserConfiguration<UnparsedExtensions> =
  | UserFlow<UnparsedExtensions>
  | UserFlow<UnparsedExtensions>[]
  | Configuration<UserFlow<UnparsedExtensions>>

export type ParseExtensionsProps<UnparsedExtensions, Extensions> = ({
  extProps,
  parsedFlow,
  splitters,
}: {
  extProps: UnparsedExtensions | {}
  parsedFlow: AlgorithmParsedFlow<{}>
  splitters: Required<Splitters>
}) => Extensions
