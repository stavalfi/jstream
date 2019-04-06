import {getActiveNodesIndexes, areNodesEqual} from './utils';
import {graphNodeToDisplayName, displayNameToFullGraphNode} from '../parser/utils';
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

const advanceFlow = payload => ({
  type: ADVANCE_FLOW,
  payload,
});

export const executeFlowCreator = reducerSelector => flowName => (dispatch, getState) => {
  const {payload} = dispatch(executeFlow({flowName, id: uuid()}));
  const {splitters, activeFlows} = reducerSelector(getState());
  const activeFlow = activeFlows.find(activeFlow => activeFlow.id === payload.id);
  const headNode = graphNodeToDisplayName(splitters)(activeFlow.graph[0]);
  return dispatch(
    advanceGraph(reducerSelector)(advanceFlow({flowName, id: payload.id, toNode: headNode})),
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
      const toNodeObject = displayNameToFullGraphNode(splitters)(flows, activeFlow.name, extendedFlow)(
        payload.toNode,
      );

      const activeNodeIndex =
        getActiveNodesIndexes(activeFlow.graph).find(i =>
          areNodesEqual(activeFlow.graph[i], toNodeObject),
        ) || 0;
      const activeNode = activeFlow.graph[activeNodeIndex];
      const sideEffect = activeFlow.sideEffects.find(sideEffect =>
        areNodesEqual(sideEffect.node, activeNode),
      );
      if (sideEffect && sideEffect.sideEffectFunc) {
        const result = sideEffect.sideEffectFunc(activeFlow)(activeNode);
        if (isObservable(result)) {
          return result.subscribe({
            next: nextNode =>
              nextNode &&
              dispatch(
                advance(
                  advanceFlow({
                    ...payload,
                    fromNode: payload.toNode,
                    toNode: nextNode,
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
                    fromNode: payload.toNode,
                    toNode: nextNode,
                  }),
                ),
              ),
          );
        }
        return (
          result &&
          dispatch(advance(advanceFlow({...payload, fromNode: payload.toNode, toNode: result})))
        );
      }
    };
  };
