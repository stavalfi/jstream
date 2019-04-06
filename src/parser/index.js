import {parseMultipleFlows} from './flows-parser';

export const parse = config => ({
  splitters: config.hasOwnProperty('splitters') ? config.splitters : {},
  flows:
    config.hasOwnProperty('splitters') && config.hasOwnProperty('flows')
      ? parseMultipleFlows(config.flows, config.splitters)
      : [],
});
