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
