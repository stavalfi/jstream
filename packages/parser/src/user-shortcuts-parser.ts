import { distractDisplayNameBySplitters, extractUniqueFlowsNamesFromGraph, removeSavedProps } from '@parser/utils'
import { ParsedFlow, ParsedUserFlow, ParseExtensionsProps, Splitters, UserFlow, UserFlowObject } from '@parser/types'
import { removeProp, toArray, uuid } from '@jstream/utils'
import _isString from 'lodash/isString'

function getFlowNameObject<Extensions>(
  splitters: Splitters,
  parsedFlowsUntilNow: ParsedFlow<Extensions>[],
  flow: UserFlowObject<{}>,
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

export const flattenUserFlowShortcuts = (splitters: Splitters) =>
  function<UnparsedExtensions, Extensions>(parsedFlowsUntilNow: ParsedFlow<Extensions>[]) {
    return (flow: UserFlow<UnparsedExtensions>): ParsedUserFlow<UnparsedExtensions> => {
      if (_isString(flow)) {
        return {
          ...fillProps(splitters, parsedFlowsUntilNow, { graph: [flow] }),
          extendsFlows: [],
        }
      }

      if (Array.isArray(flow)) {
        return {
          ...fillProps(splitters, parsedFlowsUntilNow, { graph: flow }),
          extendsFlows: [],
        }
      }

      return {
        ...removeSavedProps(flow),
        ...fillProps(splitters, parsedFlowsUntilNow, flow),
        extendsFlows: 'extends_flows' in flow ? flow.extends_flows : [],
      }
    }
  }

function fillProps<Extensions>(
  splitters: Splitters,
  parsedFlowsUntilNow: ParsedFlow<Extensions>[],
  flow: UserFlowObject<{}>,
) {
  return {
    graph: toArray(flow.graph),
    ...getFlowNameObject(splitters, parsedFlowsUntilNow, flow),
    ...('default_path' in flow && {
      defaultPath: flow.default_path.split(splitters.extends),
    }),
  }
}
