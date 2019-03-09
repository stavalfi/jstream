/*
tasks:
1. implement transformFlowEdgeBeforeParsingEdge. [DONE]
2. after (1) there won't be any need for fillStatelessDisplayName function because
 there won't be any stateless display-names when we parse. so we need to delete it. [DONE]
3. refactor this file and remove all functions that can be removed easily. [DONE]
-----
4. let the user decide what are the separators between flowName,stateName,identifier.
   the first one is mandatory but the others are optional. [DONE]
5. make tests for (4). [DONE]
6. implement feature: repeated display-names in the same flow: [DONE]
  a.do tests for repeated display-names in the same flow. (use identifiers). it may work with out any extra code). [DONE]
7. also assert children of every node if the test provide them.
8. to support multiple states in the stateMachine, we need to:
  a. build function that added all the missing states of every flow to the final graph. we will invoke this function after
   every iteration where we parse a specific sub-graph.
  b. make tests for multiple states in the stateMachine.
9. make support for composed flows. we may need to parse some other flows while we parse a flow. make it super generic to support workflows as well.
10. support workflows.
11. support composed workflows.
12. create validators: no multiple heads and so on...
 */

import {parseMultipleFlows} from './flows-parser';

export const parse = config => {
  const flows = parseMultipleFlows(config.flows, config.splitters);
  return {
    flows: config.flows ? flows : [],
    workflows:
      config.flows && config.workflows
        ? parseMultipleFlows(config.workflows, config.splitters, flows)
        : [],
  };
};
