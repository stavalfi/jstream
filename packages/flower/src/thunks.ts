import {
  AdvanceGraphThunk,
  ExecuteFlowThunkCreator,
  FlowActionByType,
  FlowActionType,
  FlowReducerSelector,
  FlowState,
  Request,
} from '@flower/types'
import { Combinations, uuid } from '@jstream/utils'
import { findByNodeOrDefault, flatMapPromisesResults, getFlowDetails } from '@flower/utils'
import {
  arePathsEqual,
  findNodeIndex,
  graphNodeToDisplayName,
  isSubsetOf,
  Node,
  ParsedFlow,
  Rule,
} from '@jstream/parser'
import { advanceFlowActionCreator, executeFlowActionCreator } from '@flower/actions'

export const executeFlowThunkCreator: ExecuteFlowThunkCreator = reducerSelector => flowIdOrName => (
  dispatch,
  getState,
) => {
  const { flows } = reducerSelector(getState())
  const flow = flows.find(
    flow =>
      ('id' in flowIdOrName && flowIdOrName.id === flow.id) ||
      ('name' in flow && 'name' in flowIdOrName && flow.name === flowIdOrName.name),
  )

  if (!flow) {
    return Promise.resolve([])
  }

  const action = dispatch(
    executeFlowActionCreator({ flowId: flow.id, ...('name' in flow && { flowName: flow.name }), activeFlowId: uuid() }),
  )

  if (!reducerSelector(getState()).activeFlows.some(activeFlow => activeFlow.id === action.payload.activeFlowId)) {
    return Promise.resolve([])
  }

  return dispatch(
    advanceGraphThunkCreator(reducerSelector)(
      advanceFlowActionCreator({
        activeFlowId: action.payload.activeFlowId,
        flowId: flow.id,
        ...('name' in flow && { flowName: flow.name }),
        toNodeIndex: 0,
      }),
    ),
  )
}

export const advanceGraphThunkCreator = (reducerSelector: FlowReducerSelector) =>
  function advance(action: FlowActionByType[FlowActionType.advanceFlowGraph]): AdvanceGraphThunk {
    return (dispatch, getState) => {
      const { advanced: lastAdvanced } = reducerSelector(getState())
      dispatch(action)

      const { advanced } = reducerSelector(getState())

      if (lastAdvanced === advanced) {
        return Promise.resolve([])
      }

      return flatMapPromisesResults(
        advanced.map(async request => {
          const actions = await getNextAdvanceActions(request)(reducerSelector(getState()))
          return flatMapPromisesResults(actions.map(action => dispatch(advance(action))))
        }),
      )
    }
  }

type GetNextAdvanceActions = (
  request: Request,
) => (state: FlowState) => Promise<FlowActionByType[FlowActionType.advanceFlowGraph][]>

const getNextAdvanceActions: GetNextAdvanceActions = request => ({ flows, activeFlows, ...restOfState }) => {
  if (!('splitters' in restOfState)) {
    return Promise.resolve([])
  }

  const { splitters } = restOfState

  const flowDetails = getFlowDetails(flows, activeFlows, request.payload.activeFlowId)
  if (!('flow' in flowDetails) || !('activeFlow' in flowDetails)) {
    return Promise.resolve([])
  }

  const { flow } = flowDetails

  const toNode = flow.graph[request.payload.toNodeIndex]
  const sideEffect = findByNodeOrDefault(
    flow.sideEffects,
    sideEffect => 'nodeIndex' in sideEffect && isSubsetOf(flow.graph[sideEffect.nodeIndex].path, toNode.path),
    rule => !('nodeIndex' in rule),
  )

  console.log(
    `request: ${
      'fromNodeIndex' in request.payload
        ? `from: ${graphNodeToDisplayName(splitters)(flow.graph[request.payload.fromNodeIndex])} (${
            request.payload.fromNodeIndex
          }), `
        : ''
    }to: ${graphNodeToDisplayName(splitters)(flow.graph[request.payload.toNodeIndex])} (${
      request.payload.toNodeIndex
    })`,
  )

  const flowWithRule = getRule(flows, flow, toNode)

  return new Promise((res, rej) => {
    try {
      res(sideEffect && sideEffect.sideEffectFunc(flow)(toNode, request.payload.toNodeIndex, flow.graph)(null))
    } catch (e) {
      rej(e)
    }
  })
    .then<string | string[], string | string[]>(
      result => {
        return flowWithRule && 'next' in flowWithRule.rule
          ? flowWithRule.rule.next(flow)(toNode, request.payload.toNodeIndex, flow.graph)(result)
          : Promise.resolve([])
      },
      error =>
        flowWithRule && 'error' in flowWithRule.rule
          ? flowWithRule.rule.error(flow)(toNode, request.payload.toNodeIndex, flow.graph)(error)
          : Promise.resolve([]),
    )
    .then<string[], string[]>(
      nextNodeNames => (nextNodeNames ? (Array.isArray(nextNodeNames) ? nextNodeNames : [nextNodeNames]) : []),
      error => {
        console.log(
          'custom rule function threw error. this library will assume that this rule returned an empty array instead. error:',
          error,
        )
        return []
      },
    )
    .then(nextNodeNames => {
      if (!flowWithRule) {
        return []
      }
      const nextNodeIndexes = nextNodeNames
        .map(findNodeIndex(splitters)(flowWithRule.flow.graph)) // array of indexes of nodes of a different graph!
        // for each node, find it's corresponding in our graph:
        .map(indexInRuleFlow => flowWithRule.flow.graph[indexInRuleFlow].path)
        .map(path => toNode.childrenIndexes.find(childIndex => isSubsetOf(path, flow.graph[childIndex].path)) as number)

      console.log(
        `from: ${graphNodeToDisplayName(splitters)(toNode)} (${request.payload.toNodeIndex}) to: [${nextNodeIndexes
          .map(i => `${graphNodeToDisplayName(splitters)(flow.graph[i])} (${i})`)
          .join(', ')}]`,
      )

      return nextNodeIndexes.map(nextNodeIndex =>
        advanceFlowActionCreator({
          activeFlowId: request.payload.activeFlowId,
          flowId: flow.id,
          ...('name' in flow && { flowName: flow.name }),
          fromNodeIndex: request.payload.toNodeIndex,
          toNodeIndex: nextNodeIndex,
        }),
      )
    })
}

type FindRule = (
  flow: ParsedFlow,
  options: Combinations<{ path: Node['path'] }>,
) => Rule<{ nodeIndex: number }> | undefined

const findRule: FindRule = (flow, options) =>
  'path' in options
    ? flow.rules.find(rule => 'nodeIndex' in rule && arePathsEqual(flow.graph[rule.nodeIndex].path, options.path))
    : flow.rules.find(rule => !('nodeIndex' in rule))

// return the rule and the flow that has that rule.
function getRule(
  flows: ParsedFlow[],
  flow: ParsedFlow,
  toNode: Node,
): { flow: ParsedFlow; rule: Rule<{ nodeIndex: number }> } | undefined {
  let flowRuleWithoutNode: ParsedFlow | undefined
  let ruleWithoutNode: Rule<{ nodeIndex: number }> | undefined

  const { path: toNodePath } = toNode
  for (let i = 0; i < toNode.path.length; i++) {
    const path = toNodePath.slice(i)
    const subFlow = flows.find(f => f.name === toNodePath[i]) as ParsedFlow
    const rule = findRule(subFlow, { path, withNodeName: true })
    if (rule) {
      return { flow: subFlow, rule }
    } else {
      if (!ruleWithoutNode) {
        flowRuleWithoutNode = subFlow
        ruleWithoutNode = findRule(subFlow, { withNodeName: false })
      }
    }
  }

  let extendedFlow: ParsedFlow | false = 'extendedFlowIndex' in flow && flows[flow.extendedFlowIndex]
  while (extendedFlow) {
    const { name: extendedFlowName } = extendedFlow
    const startIndex = toNodePath.findIndex(flowName => flowName === extendedFlowName)
    const pathWithoutExtended = toNodePath.slice(startIndex)

    const rule = findRule(extendedFlow, { path: pathWithoutExtended, withNodeName: true })
    if (rule) {
      return { flow: extendedFlow, rule }
    } else {
      if (!ruleWithoutNode) {
        flowRuleWithoutNode = extendedFlow
        ruleWithoutNode = findRule(extendedFlow, { withNodeName: false })
      }
    }
    extendedFlow = 'extendedFlowIndex' in extendedFlow && flows[extendedFlow.extendedFlowIndex]
  }

  return flowRuleWithoutNode && ruleWithoutNode && { flow: flowRuleWithoutNode, rule: ruleWithoutNode }
}
