import { distractDisplayNameBySplitters, extractUniqueFlowsNamesFromGraph } from '@parser/utils'
import { ParsedFlow, ParsedUserFlow, Splitters, UserFlow, UserFlowObject } from '@parser/types'
import { toArray } from '@jstream/utils'

function getGraph(flow: UserFlowObject) {
  return Array.isArray(flow.graph) ? flow.graph : [flow.graph]
}

function getFlowNameObject(
  splitters: Splitters,
  parsedFlowsUntilNow: ParsedFlow[],
  flow: UserFlowObject,
): { name: string } | {} {
  if ('name' in flow) {
    return { name: flow.name }
  }
  const graph = getGraph(flow)
  const flowsInGraph = extractUniqueFlowsNamesFromGraph(splitters)(graph)
  if (flowsInGraph.length === 1) {
    const possibleName = distractDisplayNameBySplitters(splitters, flowsInGraph[0]).partialPath[0]
    if (parsedFlowsUntilNow.some(flow1 => 'name' in flow1 && flow1.name === possibleName)) {
      return {}
    } else {
      return { name: possibleName }
    }
  } else {
    return {}
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
  function flatten(flow: UserFlow): ParsedUserFlow[] {
    if (typeof flow === 'string') {
      return flatten({
        graph: [flow],
      })
    }
    if (Array.isArray(flow)) {
      return flatten({
        graph: flow as string[],
      })
    }

    const flowObject: UserFlowObject = flow as UserFlowObject
    const nameObject = getFlowNameObject(splitters, parsedFlowsUntilNow, flowObject)
    return [
      {
        graph: toArray(flowObject.graph),
        ...nameObject,
        extendsFlows: flowObject.extends_flows ? flowObject.extends_flows : [],
        ...('default_path' in flowObject && {
          defaultPath: flowObject.default_path.split(splitters.extends),
        }),
        maxConcurrency: 'max_concurrency' in flowObject ? maxConcurrencyToNumber(flowObject.max_concurrency) : 1,
        side_effects: 'side_effects' in flowObject ? flowObject.side_effects : [],
        rules: 'rules' in flowObject ? flowObject.rules : [],
      },
    ]
  }
