export type Splitters = {
  extends: string
  identifier?: string
}

export type Path = string[]

export type Node = {
  path: Path
  childrenIndexes: number[]
  parentsIndexes: number[]
  identifier?: string
}

export type Graph = Node[]

export type ParsedFlow = {
  id: string
  graph: Graph
  sideEffects: SideEffect[]
} & ParsedFlowOptionalFields

export type ParsedFlowOptionalFields =
  | {}
  | {
      name: string
    }
  | {
      extendedFlowIndex: number
    }
  | {
      defaultNodeIndex: number
    }
  | {
      name: string
      extendedFlowIndex: number
    }
  | {
      extendedFlowIndex: number
      defaultNodeIndex: number
    }
  | {
      name: string
      defaultNodeIndex: number
    }
  | {
      name: string
      extendedFlowIndex: number
      defaultNodeIndex: number
    }

export type AlgorithmParsedFlow = ParsedFlow &
  (
    | {
        extendedFlowId: string
        extendedParsedFlow: AlgorithmParsedFlow
      }
    | { extendedFlowId: string }
    | { extendedParsedFlow: AlgorithmParsedFlow }
    | {})

export type SideEffect = {
  node: { path: Path; identifier?: string }
  sideEffectFunc: Function
}

export type UserGraph = string | string[]

export type UserSideEffects = { node_name: string; side_effect: Function }[]

export type UserFlowObject = {
  graph: UserGraph
  extends_flows?: UserFlow[]
  default_path?: string
  side_effects?: UserSideEffects
} & (
  | {}
  | {
      name: string
    })

export type UserFlow = UserGraph | UserFlowObject

export type ParsedUserFlow = {
  graph: UserGraph
  name?: string
  extends_flows?: UserFlow[]
  defaultPath?: string[]
  side_effects?: UserSideEffects
  extendsFlows?: UserFlow[]
}

export type UserConfigurationObject = {
  splitters?: Splitters
  flows: UserFlow[]
}

export type ParsedUserConfigurationObject = Required<UserConfigurationObject>

export type UserConfiguration = UserFlow | UserFlow[] | UserConfigurationObject
