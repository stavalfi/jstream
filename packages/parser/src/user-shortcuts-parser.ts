import { distractDisplayNameBySplitters, extractUniqueFlowsNamesFromGraph } from '@parser/utils'
import { ParsedFlow, ParsedUserFlow, Splitters, UserFlow, UserFlowObject } from '@parser/types'

function getGraph(flow: UserFlowObject) {
  return Array.isArray(flow.graph) ? flow.graph : [flow.graph]
}

function getFlowNameObject(splitters: Splitters, parsedFlowsUntilNow: ParsedFlow[], flow: UserFlowObject) {
  if ('name' in flow) {
    return { name: flow.name }
  }
  const graph = getGraph(flow)
  const flowsInGraph = extractUniqueFlowsNamesFromGraph(splitters)(graph)
  if (flowsInGraph.length === 1) {
    // I need to be sure that the same flow does not appear multiple times in the graph with multiple identifiers.
    // 2 cases: 1. "...flow0...flow0/identifier1..." 2. "...flow0/identifier1...flow0/identifier2...".
    if (splitters.identifier && graph.some(subGraph => subGraph.indexOf(splitters.identifier as string) > -1)) {
      return {}
    } else {
      const possibleName = distractDisplayNameBySplitters(splitters, flowsInGraph[0]).partialPath[0]
      if (parsedFlowsUntilNow.some(flow1 => 'name' in flow1 && flow1.name === possibleName)) {
        return {}
      } else {
        return { name: possibleName }
      }
    }
  } else {
    return {}
  }
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

    const flowObject = flow as UserFlowObject
    const graph = getGraph(flowObject)
    const nameObject = getFlowNameObject(splitters, parsedFlowsUntilNow, flowObject)
    const flowToParse = {
      graph,
      ...nameObject,
      extendsFlows: flowObject.extends_flows || [],
      ...(flowObject.default_path && {
        defaultPath: flowObject.default_path.split(splitters.extends),
      }),
      side_effects: 'side_effects' in flowObject ? flowObject.side_effects : [],
      rules: 'rules' in flowObject ? flowObject.rules : [],
    }
    return [flowToParse]
  }
