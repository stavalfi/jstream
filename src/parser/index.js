import {parseMultipleFlows1} from './flows-parser';

export const parse = config => ({
  splitters: config.hasOwnProperty('splitters') ? config.splitters : {},
  flows:
    config.hasOwnProperty('splitters') && config.hasOwnProperty('flows')
      ? parseMultipleFlows1({userFlows:config.flows, splitters:config.splitters})
      : [],
});
