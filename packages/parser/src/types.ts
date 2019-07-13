import { Combinations } from '@flow/utils'

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
  rules: Rule<{ node: { path: Path } }>[]
} & ParsedFlowOptionalFields

export type ParsedFlowOptionalFields = Combinations<{
  name: string
  extendedFlowIndex: number
  defaultNodeIndex: number
}>

export type AlgorithmParsedFlow = ParsedFlow &
  (
    | {
        extendedFlowId: string
        extendedParsedFlow: AlgorithmParsedFlow
      }
    | { extendedFlowId: string }
    | { extendedParsedFlow: AlgorithmParsedFlow }
    | {})

export type SideEffectFunction = (
  flow: ParsedFlow,
) => (toNode: Node, i?: number, graph?: Node[]) => (context?: any) => any | Promise<any>

export type SideEffect = { sideEffectFunc: SideEffectFunction } & Combinations<{
  node: { path: Path; identifier?: string }
}>

export type UserGraph = string | string[]

export type UserSideEffects = (
  | { side_effect: SideEffectFunction }
  | { node_name: string; side_effect: SideEffectFunction })[]

export type UserFlowObject = {
  graph: UserGraph
  extends_flows?: UserFlow[]
  default_path?: string
  side_effects?: UserSideEffects
  rules?: Rule<{ node_name: string }>[]
} & Combinations<{ name: string }>

export type UserFlow = UserGraph | UserFlowObject

export type NextFunctionRule = (
  flow: ParsedFlow,
) => (toNode: Node, i?: number, graph?: Node[]) => (result: any) => string | string[]

export type ErrorFunctionRule = (
  flow: ParsedFlow,
) => (toNode: Node, i?: number, graph?: Node[]) => (error: any) => string | string[]

export type Rule<Node> = (
  | { next: NextFunctionRule; error: ErrorFunctionRule }
  | { next: NextFunctionRule }
  | { error: ErrorFunctionRule }) &
  Combinations<Node>

export type ParsedUserFlow = {
  graph: UserGraph
  name?: string
  extends_flows?: UserFlow[]
  defaultPath?: string[]
  side_effects?: UserSideEffects
  extendsFlows?: UserFlow[]
  rules?: Rule<{ node_name: string }>[]
}

export type Configuration<Flow> = {
  splitters?: Splitters
  flows: Flow[]
}

export type ParsedUserConfigurationObject = Required<Configuration<UserFlow>>

export type UserConfiguration = UserFlow | UserFlow[] | Configuration<UserFlow>
