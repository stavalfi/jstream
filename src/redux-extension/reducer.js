import {ADVANCE_FLOW, UPDATE_CONFIG, EXECUTE_FLOW} from './actions';
import {areNodesEqual, getActiveNodesIndexes} from './utils';
import {displayNameToFullGraphNode} from '../parser/utils';
const initialState = {activeFlows: [], nonActiveWorkflows: [], flows: []};

export const reducer = (lastState = initialState, action) => {
  const {activeFlows, flows, splitters} = lastState;
  const {type, payload = {}} = action;
  const {flowName, context, id, fromNode, toNode} = payload;
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
    case ADVANCE_FLOW: {
      const activeFlowIndex = activeFlows.findIndex(activeFlow => activeFlow.id === id);
      const activeFlow = activeFlows[activeFlowIndex];
      const extendedFlow =
        activeFlow.hasOwnProperty('extendedFlowIndex') && flows[activeFlow.extendedFlowIndex];

      const fromNodeObject =
        payload.hasOwnProperty('fromNode') &&
        displayNameToFullGraphNode(splitters)(flows, activeFlow.name, extendedFlow)(fromNode);
      const toNodeObject = displayNameToFullGraphNode(splitters)(flows, activeFlow.name, extendedFlow)(
        toNode,
      );

      return {
        ...lastState,
        activeFlows: [
          ...lastState.activeFlows.slice(0, activeFlowIndex),
          {
            ...activeFlows[activeFlowIndex],
            graph: advance(activeFlows[activeFlowIndex].graph, fromNodeObject, toNodeObject),
            ...(payload.hasOwnProperty('context') && {context}),
          },
          ...lastState.activeFlows.slice(activeFlowIndex + 1),
        ],
      };
    }
  }
  return lastState;
};

const advance = (graph, fromNode, toNode) => {
  const fromActiveNodeIndex =
    fromNode &&
    getActiveNodesIndexes(graph).findIndex(activeNodeIndex =>
      areNodesEqual(graph[activeNodeIndex], fromNode),
    );
  const toActiveNodeIndex = fromNode
    ? graph[fromActiveNodeIndex].childrenIndexes.find(childIndex =>
        areNodesEqual(graph[childIndex], toNode),
      )
    : graph.findIndex(activeNode => areNodesEqual(activeNode, toNode));

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
