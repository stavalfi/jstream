import {ADVANCE_FLOW, UPDATE_CONFIG, EXECUTE_FLOW} from './actions';
import {areNodesEqual, getActiveNodesIndexes} from './utils';
const initialState = {activeFlows: [], nonActiveWorkflows: [], flows: []};

export const reducer = (lastState = initialState, action) => {
  const {activeFlows, flows, splitters} = lastState;
  const {type, payload = {}} = action;
  const {flowName, context, id, fromNodeIndex, toNodeIndex} = payload;
  switch (type) {
    case UPDATE_CONFIG:
      return {
        ...lastState,
        ...payload,
        activeFlows: lastState.activeFlows,
        nonActiveWorkflows: lastState.nonActiveWorkflows,
      };
    case EXECUTE_FLOW: {
      const flow = flows.find(flow => flow.name === flowName);
      if (!flow) {
        return lastState;
      } else {
        return {
          ...lastState,
          activeFlows: activeFlows.concat([
            {
              ...flow,
              id,
              context,
              graph: flow.graph,
            },
          ]),
        };
      }
    }
    case ADVANCE_FLOW: {
      const activeFlowIndex = activeFlows.findIndex(activeFlow => activeFlow.id === id);
      if (activeFlowIndex === -1) {
        return lastState;
      }

      return {
        ...lastState,
        activeFlows: [
          ...lastState.activeFlows.slice(0, activeFlowIndex),
          {
            ...activeFlows[activeFlowIndex],
            graph: advance(activeFlows[activeFlowIndex].graph, fromNodeIndex, toNodeIndex),
            ...(payload.hasOwnProperty('context') && {context}),
          },
          ...lastState.activeFlows.slice(activeFlowIndex + 1),
        ],
      };
    }
  }
  return lastState;
};

const advance = (graph, fromNodeIndex, toNodeIndex) => {
  const fromActiveNodeIndex =
    Number.isInteger(fromNodeIndex) &&
    getActiveNodesIndexes(graph).findIndex(activeNodeIndex =>
      areNodesEqual(graph[activeNodeIndex], graph[fromNodeIndex]),
    );
  const toActiveNodeIndex = Number.isInteger(fromNodeIndex)
    ? graph[fromActiveNodeIndex].childrenIndexes.find(childIndex =>
        areNodesEqual(graph[childIndex], graph[toNodeIndex]),
      )
    : graph.findIndex(activeNode => areNodesEqual(activeNode, graph[toNodeIndex]));

  return graph.map((node, i) => {
    if (i === fromActiveNodeIndex) {
      return {
        ...node,
        status: 'non-active',
      };
    }
    if (i === toActiveNodeIndex) {
      return {
        ...node,
        status: 'active',
      };
    }
    return node;
  });
};
