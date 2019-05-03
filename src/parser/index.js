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
      const splitters =
        config.hasOwnProperty('splitters') && config.splitters.hasOwnProperty('extends')
          ? config.splitters
          : {
              extends: '/',
            };
      const flows = config.hasOwnProperty('flows') ? config.flows : [];
      return {splitters, flows};
  }
};
