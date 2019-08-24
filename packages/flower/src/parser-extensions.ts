import { ParseExtensionsProps, findNodeIndex } from '@jstream/parser'
import { FlowExtensions, UnparsedFlowExtensions } from '@flower/types'

const parseExtensions: ParseExtensionsProps<UnparsedFlowExtensions, FlowExtensions> = params => ({
  maxConcurrency: parseMaxConcurrency(params),
  rules: parseRules(params),
  sideEffects: parseSideEffects(params),
})

export default parseExtensions

const parseMaxConcurrency: ParseExtensionsProps<UnparsedFlowExtensions, FlowExtensions['maxConcurrency']> = ({
  extProps,
}) => {
  if (!('max_concurrency' in extProps)) {
    return 1
  }

  const { max_concurrency } = extProps

  if (max_concurrency === true) {
    return Infinity
  }

  if (max_concurrency === 0) {
    return 0
  }

  if (!max_concurrency) {
    return 1
  }

  return max_concurrency
}

const parseRules: ParseExtensionsProps<UnparsedFlowExtensions, FlowExtensions['rules']> = ({
  extProps,
  parsedFlow,
  splitters,
}) => {
  const toNodeIndex = findNodeIndex(splitters)(parsedFlow.graph)
  return 'rules' in extProps && extProps.rules
    ? extProps.rules.map(rule => ({
        ...('node_name' in rule && { nodeIndex: toNodeIndex(rule.node_name) }),
        ...rule,
      }))
    : []
}

const parseSideEffects: ParseExtensionsProps<UnparsedFlowExtensions, FlowExtensions['sideEffects']> = ({
  extProps,
  parsedFlow,
  splitters,
}) => {
  const toNodeIndex = findNodeIndex(splitters)(parsedFlow.graph)
  return 'side_effects' in extProps && extProps.side_effects
    ? extProps.side_effects.map(sideEffect => ({
        ...('node_name' in sideEffect && { nodeIndex: toNodeIndex(sideEffect.node_name) }),
        ...sideEffect,
      }))
    : []
}
