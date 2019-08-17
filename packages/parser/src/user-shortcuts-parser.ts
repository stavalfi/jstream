import { distractDisplayNameBySplitters, extractUniqueFlowsNamesFromGraph } from '@parser/utils'
import { ParsedFlow, ParsedUserFlow, Splitters, UserFlow, UserFlowObject } from '@parser/types'
import { toArray, uuid } from '@jstream/utils'

function getFlowNameObject(
  splitters: Splitters,
  parsedFlowsUntilNow: ParsedFlow[],
  flow: UserFlowObject,
): { hasPredefinedName: boolean; name: string } {
  if ('name' in flow) {
    return { hasPredefinedName: true, name: flow.name }
  }
  const graph = toArray(flow.graph)
  const flowsInGraph = extractUniqueFlowsNamesFromGraph(splitters)(graph)
  const defaultNameObject = { hasPredefinedName: false, name: uuid().replace(new RegExp(splitters.extends, 'g'), '') }
  if (flowsInGraph.length === 1) {
    const possibleName = distractDisplayNameBySplitters(splitters, flowsInGraph[0]).partialPath[0]
    if (parsedFlowsUntilNow.some(flow1 => 'name' in flow1 && flow1.name === possibleName)) {
      return defaultNameObject
    } else {
      return { hasPredefinedName: true, name: possibleName }
    }
  } else {
    return defaultNameObject
  }
}

function maxConcurrencyToNumber(maxConcurrency: boolean | number): number {
  if (maxConcurrency === true) {
    return Infinity
  }
  if (maxConcurrency === false) {
    return 1
  }
  return maxConcurrency
}

export const flattenUserFlowShortcuts = (splitters: Splitters) => (parsedFlowsUntilNow: ParsedFlow[]) =>
  function flatten(flow: UserFlow): ParsedUserFlow {
    if (typeof flow === 'string') {
      return flatten({
        graph: [flow],
      })
    }
    if (Array.isArray(flow)) {
      return flatten({
        graph: flow,
      })
    }

    const nameObject = getFlowNameObject(splitters, parsedFlowsUntilNow, flow)
    return {
      graph: toArray(flow.graph),
      ...nameObject,
      extendsFlows: flow.extends_flows ? flow.extends_flows : [],
      ...('default_path' in flow && {
        defaultPath: flow.default_path.split(splitters.extends),
      }),
      maxConcurrency: 'max_concurrency' in flow ? maxConcurrencyToNumber(flow.max_concurrency) : 1,
      side_effects: 'side_effects' in flow ? flow.side_effects : [],
      rules: 'rules' in flow ? flow.rules : [],
    }
  }
