import { Configuration } from '@jstream/parser'
import { Flow } from '@jstream/flower'
import { jsonToString, extractConfig, isConfigChanged, prettifyJsonString } from '@editor/utils'
import { Reducer } from 'react'

export type State =
  | {}
  | { configAsString: string; error: string }
  | {
      config: Required<Configuration<Flow>>
      configAsString: string
      selectedFlowIndex: number
      error: string
    }
  | {
      config: Required<Configuration<Flow>>
      configAsString: string
      selectedFlowIndex: number
      pretiffed: boolean
    }
  | {
      config: Required<Configuration<Flow>>
      configAsString: string
      selectedFlowIndex: number
      pretiffed: boolean
      error: string
    }

export type ConfigAction = {
  type: 'set-config'
  payload: Required<Configuration<Flow>>
}

export type SelectedFlowIndexAction = {
  type: 'set-selected-flow-index'
  payload: number
}

export type StringConfigAction = {
  type: 'set-string-config'
  payload: string
}

export type PrettifyStringConfigAction = {
  type: 'prettify-string-config'
}

export type Actions = ConfigAction | SelectedFlowIndexAction | StringConfigAction | PrettifyStringConfigAction

export const reducer: Reducer<State, Actions> = (prevState, action) => {
  switch (action.type) {
    case 'prettify-string-config':
      if ('configAsString' in prevState && 'pretiffed' in prevState && !prevState.pretiffed) {
        const result = prettifyJsonString(prevState.configAsString)
        if ('jsonAsString' in result) {
          return {
            ...prevState,
            pretiffed: true,
            configAsString: result.jsonAsString,
          }
        } else {
          return {
            ...prevState,
            pretiffed: true,
            error: result.error,
          }
        }
      }
      break
    case 'set-string-config': {
      const result = extractConfig(action.payload)
      if (typeof result === 'string') {
        return {
          ...prevState,
          configAsString: action.payload,
          pretiffed: false,
          error: result,
        }
      } else {
        if (!('configAsString' in prevState) || prevState.configAsString !== action.payload) {
          return {
            config: !('config' in prevState) || isConfigChanged(prevState.config, result) ? result : prevState.config,
            configAsString: action.payload,
            pretiffed: false,
            selectedFlowIndex: result.flows.length - 1,
          }
        }
      }
      break
    }
    case 'set-config':
      if ('config' in prevState && isConfigChanged(prevState.config, action.payload)) {
        return {
          config: action.payload,
          configAsString: jsonToString(action.payload),
          selectedFlowIndex: action.payload.flows.length - 1,
          pretiffed: true,
        }
      }
      break
    case 'set-selected-flow-index':
      if ('selectedFlowIndex' in prevState) {
        return {
          ...prevState,
          selectedFlowIndex: action.payload,
        }
      }
      break
  }
  return prevState
}
