export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

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
  extendedFlowId?: string
  extendedFlowIndex?: number
  extendedParsedFlow?: ParsedFlow
  name?: string
  defaultNodeIndex?: number
  sideEffects: SideEffect[]
}

export type SideEffect = {
  node: { path: Path; identifier?: string }
  sideEffectFunc: Function
}

export type UserGraph = string | string[]

export type UserSideEffects = { node_name: string; side_effect: Function }[]

export type UserFlowObject = Pick<ParsedFlow, 'name'> & {
  graph: UserGraph
  extends_flows?: UserFlow[]
  default_path?: string
  side_effects?: UserSideEffects
}
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
