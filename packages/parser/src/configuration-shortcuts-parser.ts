import { Splitters, UserConfiguration, UserFlow } from '@parser/types'

export default function initializeConfig<Extensions>(
  config: UserConfiguration<Extensions>,
): {
  splitters: Splitters
  userFlows: UserFlow<Extensions>[]
} {
  if (typeof config === 'string') {
    return {
      splitters: {
        extends: '/',
      },
      userFlows: [config],
    }
  }
  if (Array.isArray(config)) {
    return {
      splitters: {
        extends: '/',
      },
      userFlows: config,
    }
  }
  if (typeof config === 'object') {
    if (
      'graph' in config ||
      'name' in config ||
      'default_path' in config ||
      'side_effects' in config ||
      'extends_flows' in config
    ) {
      return {
        splitters: {
          extends: '/',
        },
        userFlows: [config],
      }
    } else {
      const configObject = config as {
        splitters?: Splitters
        flows: UserFlow<Extensions>[]
      }
      const splitters =
        configObject.splitters && 'extends' in configObject.splitters
          ? configObject.splitters
          : {
              extends: '/',
            }
      const userFlows = 'flows' in config ? configObject.flows : []
      return { splitters, userFlows }
    }
  }

  return {
    splitters: {
      extends: '/',
    },
    userFlows: [],
  }
}
