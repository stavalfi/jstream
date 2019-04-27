import {isSubsetOf} from '../parser/utils';

export function areNodesEqual(node1, node2) {
  if (node1.identifier !== node2.identifier) {
    return false;
  }
  if (node1.path.length !== node2.path.length) {
    return false;
  }
  return node1.path.every((flowName, i) => flowName === node2.path[i]);
}

export function getActiveNodesIndexes(graph) {
  const visited = graph.map(() => false);
  function find(i) {
    if (visited[i]) return [];
    visited[i] = true;
    if (graph[i].status === 'active') {
      return [i];
    }
    return graph[i].childrenIndexes.flatMap(find);
  }

  return find(0);
}

export function getSideEffects(flows, flow) {
  if (!flow) {
    return [];
  } else {
    if (!flow.hasOwnProperty('sideEffects')) {
      return getSideEffects(flows, flows[flow.extendedFlowIndex]);
    } else {
      return flow.sideEffects;
    }
  }
}

export const userInputNodeToNodeIndex = ({stringToNode, graph}) => fromNodeIndex => userNode => {
  if (Number.isInteger(userNode)) {
    return userNode;
  } else {
    if (typeof userNode === 'string' || userNode instanceof String) {
      if (Number.isInteger(fromNodeIndex)) {
        return graph[fromNodeIndex].childrenIndexes.find(i =>
          isSubsetOf([userNode], graph[i].path),
        );
      } else {
        return graph.findIndex(node => areNodesEqual(node, stringToNode(userNode)));
      }
    } else {
      if (Array.isArray(userNode)) {
        if (Number.isInteger(fromNodeIndex)) {
          return graph[fromNodeIndex].childrenIndexes.find(i =>
            isSubsetOf(userNode, graph[i].path),
          );
        } else {
          // todo: fill this
        }
      }
    }
  }
};
