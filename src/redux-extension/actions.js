import {
  getActiveNodesIndexes,
  areNodesEqual,
  getSideEffects,
  userInputNodeToNodeIndex,
} from './utils';
import {displayNameToFullGraphNode, isSubsetOf} from '../parser/utils';
import isObservable from 'is-observable';
import isPromise from 'is-promise';
import uuid from 'uuid/v1';

export const UPDATE_CONFIG = 'update-config';
export const EXECUTE_FLOW = 'execute-flow';
export const ADVANCE_FLOW = 'advance-flow-graph';

export const updateConfig = config => ({
  type: UPDATE_CONFIG,
  payload: config,
});

const executeFlow = payload => {
  return {
    type: EXECUTE_FLOW,
    payload,
  };
};

export const advanceFlow = payload => ({
  type: ADVANCE_FLOW,
  payload,
});

export const executeFlowCreator = reducerSelector => flowName => (dispatch, getState) => {
  const action = dispatch(executeFlow({flowName, id: uuid()}));
  const {activeFlows} = reducerSelector(getState());
  const activeFlow = activeFlows.find(activeFlow => activeFlow.id === action.payload.id);
  if (!activeFlow) {
    return action;
  }
  return dispatch(
    advanceGraph(reducerSelector)(advanceFlow({flowName, id: action.payload.id, toNodeIndex: 0})),
  );
};

export const advanceGraph = reducerSelector =>
  function advance(action) {
    return (dispatch, getState) => {
      const {payload} = dispatch(action);
      const {splitters, flows, activeFlows} = reducerSelector(getState());
      const activeFlow = activeFlows.find(activeFlow => activeFlow.id === payload.id);
      const extendedFlow =
        activeFlow.hasOwnProperty('extendedFlowIndex') && flows[activeFlow.extendedFlowIndex];

      const userNodeToNodeObject = userInputNodeToNodeIndex({
        stringToNode: displayNameToFullGraphNode(splitters)(flows, activeFlow.name, extendedFlow),
        graph: activeFlow.graph,
      });

      const activeNodeIndex =
        getActiveNodesIndexes(activeFlow.graph).find(i =>
          areNodesEqual(activeFlow.graph[i], activeFlow.graph[payload.toNodeIndex]),
        ) || 0;
      const activeNode = activeFlow.graph[activeNodeIndex];
      const sideEffects = getSideEffects(flows, activeFlow);
      const sideEffect = sideEffects.find(sideEffect =>
        isSubsetOf(sideEffect.node.path, activeNode.path),
      );

      if (!sideEffect || !sideEffect.hasOwnProperty('sideEffectFunc')) {
        return action;
      }

      const result = sideEffect.sideEffectFunc(activeFlow)(activeNode);

      if (isObservable(result)) {
        return result.subscribe({
          next: nextNode =>
            nextNode &&
            dispatch(
              advance(
                advanceFlow({
                  ...payload,
                  fromNodeIndex: payload.toNodeIndex,
                  toNodeIndex: userNodeToNodeObject(payload.toNodeIndex)(nextNode),
                }),
              ),
            ),
        });
      }
      if (isPromise(result)) {
        return result.then(
          nextNode =>
            nextNode &&
            dispatch(
              advance(
                advanceFlow({
                  ...payload,
                  fromNodeIndex: payload.toNodeIndex,
                  toNodeIndex: userNodeToNodeObject(payload.toNodeIndex)(nextNode),
                }),
              ),
            ),
        );
      }

      const toNodeIndex = userNodeToNodeObject(payload.toNodeIndex)(result);
      return (
        result &&
        dispatch(
          advance(
            advanceFlow({
              ...payload,
              fromNodeIndex: payload.toNodeIndex,
              toNodeIndex: toNodeIndex,
            }),
          ),
        )
      );
    };
  };
