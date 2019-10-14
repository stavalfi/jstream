import parse, { Configuration } from '@jstream/parser'
import { Flow } from '@jstream/flower'
import Jsonic from 'jsonic'
// @ts-ignore
import dJSON from 'dirty-json'
import deepEqual from 'deep-equal'
import _omit from 'lodash/omit'

export const jsonToString = (config: any): string => JSON.stringify(config, null, '\t')

export const fixJsonAsString = (jsonAsString: string): any => {
  try {
    return Jsonic(jsonAsString)
  } catch (e) {
    return dJSON.parse(jsonAsString)
  }
}

export const prettifyJsonString = (jsonAsString: string): { jsonAsString: string } | { error: string } => {
  try {
    const result = fixJsonAsString(jsonAsString)
    return {
      jsonAsString: jsonToString(result),
    }
  } catch (e) {
    return {
      error: e.message,
    }
  }
}

type Error = string
export const extractConfig = (configAsString: string): Required<Configuration<Flow>> | Error => {
  try {
    const result = fixJsonAsString(configAsString)
    return parse(result)
  } catch (e) {
    return e.message
  }
}

export const isConfigChanged = (
  prevConfig: Required<Configuration<Flow>>,
  newConfig: Required<Configuration<Flow>>,
): boolean => {
  const filterFlow = (flow: Flow) => ({
    ..._omit(flow, ['id', 'pathsGroups', 'name']),
    name: flow.hasPredefinedName ? flow.name : 'random_name',
    graph: flow.graph.map(node => _omit(node, 'path')),
  })
  return (
    !deepEqual(prevConfig.flows.map(filterFlow), newConfig.flows.map(filterFlow)) ||
    !deepEqual(prevConfig.splitters, newConfig.splitters)
  )
}
