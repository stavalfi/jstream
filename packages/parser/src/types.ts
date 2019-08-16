import { Combinations } from '@jstream/utils'

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

export type ParsedFlow = {
  id: string
  maxConcurrency: number
  graph: Graph
  pathsGroups: string[][]
  sideEffects: SideEffect[]
  rules: Rule<{ nodeIndex: number }>[]
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
    | {})

export type SideEffectFunction = (
  flow: ParsedFlow,
) => (toNode: Node, i?: number, graph?: Node[]) => (context?: any) => any | Promise<any>

export type SideEffect = { sideEffectFunc: SideEffectFunction } & Combinations<{
  node: { path: Path }
}>

export type UserGraph = string | string[]

export type UserSideEffects = (
  | { side_effect: SideEffectFunction }
  | { node_name: string; side_effect: SideEffectFunction })[]

export type UserFlowObject = {
  graph: UserGraph
  extends_flows?: UserFlow[]
} & Combinations<{
  name: string
  max_concurrency: boolean | number
  default_path: string
  side_effects: UserSideEffects
  rules: Rule<{ node_name: string }>[]
}>

export type UserFlow = UserGraph | UserFlowObject

export type NextFunctionRule = (
  flow: ParsedFlow,
) => (
  toNode: Node,
  i?: number,
  graph?: Node[],
) => (result: any) => string | string[] | Promise<string> | Promise<string[]>

export type ErrorFunctionRule = (
  flow: ParsedFlow,
) => (
  toNode: Node,
  i?: number,
  graph?: Node[],
) => (error: any) => string | string[] | Promise<string> | Promise<string[]>

export type Rule<T> = (
  | { next: NextFunctionRule; error: ErrorFunctionRule }
  | { next: NextFunctionRule }
  | { error: ErrorFunctionRule }) &
  (T | {})

export type ParsedUserFlow = {
  maxConcurrency: number
  graph: string[]
  extendsFlows: UserFlow[]
  rules: Rule<{ node_name: string }>[]
  side_effects: UserSideEffects
} & Combinations<{
  name: string
  defaultPath: string[]
}>

export type Configuration<Flow> = {
  splitters?: Splitters
  flows: Flow[]
}

export type ParsedUserConfigurationObject = Required<Configuration<UserFlow>>

export type UserConfiguration = UserFlow | UserFlow[] | Configuration<UserFlow>
