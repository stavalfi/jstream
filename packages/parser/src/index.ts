import { parseMultipleFlows } from 'flows-parser'
import { ParsedFlow, Splitters, UserConfiguration, UserFlow, UserFlowObject } from 'types'

type Parse = (
  userConfiguration: UserConfiguration,
) => {
  splitters: Splitters
  flows: ParsedFlow[]
}
export const parse: Parse = userConfiguration => {
  const { splitters, flows } = initializeConfig(userConfiguration)
  return {
    splitters: splitters,
    flows: parseMultipleFlows({
      userFlows: flows,
      splitters,
    }),
  }
}

type InitializeConfig = (
  userConfiguration: UserConfiguration,
) => {
  splitters: Splitters
  flows: UserFlow[]
}
const initializeConfig: InitializeConfig = config => {
  if (typeof config === 'string') {
    return {
      splitters: {
        extends: '/',
      },
      flows: [config],
    }
  }
  if (Array.isArray(config)) {
    return {
      splitters: {
        extends: '/',
      },
      flows: config as UserFlow[],
    }
  }
  if (typeof config === 'object') {
    if (
      config.hasOwnProperty('graph') ||
      config.hasOwnProperty('name') ||
      config.hasOwnProperty('default_flow_name') ||
      config.hasOwnProperty('side_effects') ||
      config.hasOwnProperty('extends_flows')
    ) {
      return {
        splitters: {
          extends: '/',
        },
        flows: [config as UserFlowObject],
      }
    } else {
      const configObject = config as {
        splitters?: Splitters
        flows: UserFlow[]
      }
      const splitters =
        configObject.splitters && configObject.splitters.hasOwnProperty('extends')
          ? configObject.splitters
          : {
              extends: '/',
            }
      const flows = config.hasOwnProperty('flows') ? configObject.flows : []
      return { splitters, flows }
    }
  }

  return {
    splitters: {
      extends: '/',
    },
    flows: [],
  }
}

export { graphNodeToDisplayName } from 'utils'
export { UserConfigurationObject, ParsedUserConfigurationObject } from 'types'
