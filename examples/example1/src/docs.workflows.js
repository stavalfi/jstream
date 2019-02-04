import {kindof} from '../../../src/utils';

function getCurrentNode() {
}

function getCurrentNodes() {
}

export default {
  workflowStateMachine: [
    "should_start:failed,canceled,succeed"
  ],
  // NOTE: there are no repeats of stateNames inside flowStateMachine (for supporting unidirectional flows).
  defaultLeafState: 'succeed',
  // conditions for flowStateMachine:
  // 1. no repeats. -> because we want unidirectional flows && workflows ONLY
  flowStateMachine: [
    "should_start:waiting,failed,canceled,succeed",
    "waiting:failed,canceled,succeed"
  ],
  // will be called after user dispatch anything related to a specific workflow to be able
  // to MAYBE change the state of all the workflow according to the dispatch of the
  // user (cancel workflow/user approved something/..).
  // params:
  // workflow = {workflowId,workflowStateGraph,workflowStateGraphCurrentNode,graph,parentNodes,currentNode}.
  // return:
  // array of [node,nextStateName] such that for each node, if one of his children is `nextStateName`,
  // then force the next state of `node`'s flow to be `nextStateName` and then the lib does one of the following:
  // 1. invoke defaultLogicByStateName-specific function by the state that is now
  // active (we invoke state-function only for non-leafs states).
  // 2. for leafs states only -> start the next flow according to the workflow graph.
  defaultWorkflowLogic_userChangedWorkflowState: {
    'canceled': ({workflowStateGraph, graph}) => {
      return getCurrentNodes(graph)
        .map(node => ({
          node,
          nextStateName: 'canceled'
        }));
    }
  },
  // all the functions in defaultLogicByStateName return the next state.
  // if the function returned promise, then maybe there was something the
  // caused the workflow to already continue to other node. in this case,
  // that promise's result is not relevant any more. the algorithm is:
  // the first one who change the workflow has the priority.
  // NOTE: user must specify function for all the states that are not leafs.
  // if there is a missing function, we throw error in the parser.
  // priority: statesLogic_specific(highest),statesLogic,defaultLogicByStateName(lowest)
  defaultLogicByStateName: {
    'shouldStart': lastStateResult => (workflow, logic) => {
      let result;
      try {
        result = logic(workflow);
      } catch (error) {
        return {
          result: error,
          nextStateName: 'failed'
        };
      }
      if (kindof(result) === 'promise') {
        return {
          result,
          nextStateName: 'waiting'
        };
      } else {
        return {
          result,
          nextStateName: 'succeed'
        };
      }
    },
    'waiting': lastStateResult => workflow => logic => {
      return lastStateResult.then(result => ({result, nextStateName: 'succeed'}))
        .catch(error => ({result: error, nextStateName: 'failed'}));
    }
  },
  flows: [
    {
      name: 'manageUser',
      flowLogic: (lastStateResult, workflow) =>
        console.log(`this should be async function that returns something
                         that will be added to the "lastNode" variable in the next time the
                          flow changes his state.`, lastStateResult, workflow),
      statesLogic: lastStateName => (lastStateResult, workflow) =>
        console.log(`this should be async function that returns something.`, lastStateName, lastStateResult, workflow),
      statesLogic_specific: {
        'stateName': (lastStateResult, workflow) =>
          console.log(`this should be async function that returns something
                         that will be added to the "lastNode" variable in the next time the
                          flow changes his state.`, lastStateResult, workflow),
      }
    }
  ],
  // rules:
  // 1. for each flow in workflow, if it contain a specific state, it must contain all the default-transition of that flow.
  workflows: [
    'createUser',

  ]
};