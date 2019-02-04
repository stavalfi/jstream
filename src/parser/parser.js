import {findCharIndex} from './utils';

export default function parse({
  edges,
  improveDisplayName = displayName => displayName,
  displayNameToNode,
  nodeToDisplayName = node => node,
}) {
  return edges.reduce((graph, subGraph) => {
    const displayNameToIndexes = graph
      .map((node, index) => ({
        [nodeToDisplayName(node)]: index,
      }))
      .reduce((mapper, displayNameToIndexObj) => ({...mapper, ...displayNameToIndexObj}), {});

    return parseSubGraph(
      graph,
      displayNameToIndexes,
      subGraph,
      displayNameToNode,
      improveDisplayName,
    );
  }, []);
}

function parseSubGraph(
  graph,
  displayNameToIndexes,
  subGraph,
  displayNameToNode,
  improveDisplayName,
) {
  function fill({fromIndex, toIndex, parentsIndexes, newHeadsIndexes}) {
    if (fromIndex > toIndex)
      return {
        endIndex: toIndex,
        headsIndexes: newHeadsIndexes,
      };

    switch (subGraph[fromIndex]) {
      case '[': {
        const arrayEndIndex = findCloseAfterOpenParenthesesIndex(subGraph, fromIndex + 1, toIndex);

        const {headsIndexes} = fill({
          fromIndex: fromIndex + 1,
          toIndex: arrayEndIndex - 1,
          parentsIndexes,
          newHeadsIndexes: [],
        });

        return fill({
          fromIndex: arrayEndIndex + 1,
          toIndex,
          parentsIndexes,
          newHeadsIndexes: [...newHeadsIndexes, ...headsIndexes],
        });
      }
      case ':': {
        const {endIndex} = fill({
          fromIndex: fromIndex + 1,
          toIndex,
          parentsIndexes: newHeadsIndexes,
          newHeadsIndexes: [],
        });
        return {endIndex, headsIndexes: newHeadsIndexes};
      }
      case ',': {
        return fill({
          fromIndex: fromIndex + 1,
          toIndex,
          parentsIndexes,
          newHeadsIndexes,
        });
      }
      default: {
        const displayNameEndIndex = findCharIndex({
          str: subGraph,
          fromIndex: fromIndex,
          toIndex,
          chars: [',', ':'],
        });

        const displayName = improveDisplayName(subGraph.slice(fromIndex, displayNameEndIndex));

        if (!displayNameToIndexes.hasOwnProperty(displayName)) {
          const newNode = {
            ...displayNameToNode(displayName),
            childrenIndexes: [],
            parentsIndexes,
          };

          graph.push(newNode);
          displayNameToIndexes[displayName] = graph.length - 1;
        }

        const nodeIndex = displayNameToIndexes[displayName];

        parentsIndexes
          .filter(i => !graph[i].childrenIndexes.includes(nodeIndex))
          .forEach(i => graph[i].childrenIndexes.push(nodeIndex));

        return fill({
          fromIndex: displayNameEndIndex,
          toIndex,
          parentsIndexes,
          newHeadsIndexes: [...newHeadsIndexes, nodeIndex],
        });
      }
    }
  }

  fill({
    fromIndex: 0,
    toIndex: subGraph.length - 1,
    parentsIndexes: [],
    newHeadsIndexes: [],
  });

  return graph;
}

export function findCloseAfterOpenParenthesesIndex(str, from, to) {
  let balance = 1; // positive balance means we have seen more open then closed parentheses.
  for (let i = from; i <= to; i++)
    if (str[i] === '[') balance++;
    else if (str[i] === ']')
      if (balance === 1) return i;
      else balance--;
  return -1;
}

function minimizeGraphArray(graphArray) {
  if (graphArray.length === 1) {
    return graphArray;
  }
  const copiedGraphArray = graphArray.map(node => ({
    ...node,
    parentsIndexes: node.parentsIndexes.slice(),
    childrenIndexes: node.childrenIndexes.slice(),
  }));
  const ids = new Map();
  copiedGraphArray.forEach(node => {
    const id = {};
    node.id = id;
    ids.set(id, node);
  });
  copiedGraphArray.forEach(node => {
    node.parentsIds = node.parentsIndexes.map(i => copiedGraphArray[i].id);
    node.childrenIds = node.childrenIndexes.map(i => copiedGraphArray[i].id);
  });

  function markReachableNodes(graphArray, nodeIndex) {
    graphArray[nodeIndex].reachable = true;
    graphArray[nodeIndex].childrenIndexes.forEach(childIndex =>
      markReachableNodes(graphArray, childIndex),
    );
  }

  function putHeadInFirstCell(reachableNodes) {
    return [
      reachableNodes.find(node => node.parentsIds.length === 0),
      ...reachableNodes.filter(node => node.parentsIds.length > 0),
    ];
  }

  markReachableNodes(copiedGraphArray, 0);

  const reachableNodes = copiedGraphArray.filter(node => node.reachable);

  const minimizedGraphArray = putHeadInFirstCell(reachableNodes)
    .map((node, index) => {
      ids.get(node.id).index = index;
      return node;
    })
    .map(node => {
      return {
        ...node,
        parentsIndexes: node.parentsIds.map(id => ids.get(id).index),
        childrenIndexes: node.childrenIds.map(id => ids.get(id).index),
      };
    });

  return minimizedGraphArray;
}
