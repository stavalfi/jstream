import {parseMultipleFlows1} from './flows-parser';
import kindof from 'kindof';
export const parse = config => {
  const initializedConfig = initializeConfig(config);
  return {
    splitters: initializedConfig.splitters,
    flows: parseMultipleFlows1({
      userFlows: initializedConfig.flows,
      splitters: initializedConfig.splitters,
    }),
  };
};

const initializeConfig = config => {
  switch (kindof(config)) {
    case 'string':
      return {
        splitters: {
          extends: '/',
        },
        flows: [config],
      };
    case 'object':
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
          flows: [config],
        };
      } else {
        const splitters =
          config.hasOwnProperty('splitters') && config.splitters.hasOwnProperty('extends')
            ? config.splitters
            : {
                extends: '/',
              };
        const flows = config.hasOwnProperty('flows') ? config.flows : [];
        return {splitters, flows};
      }
    case 'array':
      return {
        splitters: {
          extends: '/',
        },
        flows: config,
      };
  }
};
