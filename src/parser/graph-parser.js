import {compose} from 'redux';
import kindof from 'kindof';

export const parseGraph = (graphNodeToDisplayName, displayNameToFullGraphNode, graphToParse) => {
  const graph = kindof(graphToParse) === 'array' ? graphToParse : [graphToParse];
  return graph.reduce(parseSubGraph(graphNodeToDisplayName, displayNameToFullGraphNode), []);
};

const parseSubGraph = (nodeToDisplayName, displayNameToNode) =>
  function parse(currentGraphArray, subFlowToParse) {
    const displayNameToIndexes = currentGraphArray
      .map((node, index) => ({
        [nodeToDisplayName(node)]: index,
      }))
      .reduce((mapper, displayNameToIndexObj) => ({...mapper, ...displayNameToIndexObj}), {});

    function fill({fromIndex, toIndex, parentsIndexes, newHeadsIndexes}) {
      if (fromIndex > toIndex)
        return {
          endIndex: toIndex,
          headsIndexes: newHeadsIndexes,
        };

      switch (subFlowToParse[fromIndex]) {
        case '[': {
          const arrayEndIndex = findCloseAfterOpenParenthesesIndex(
            subFlowToParse,
            fromIndex + 1,
            toIndex,
          );

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
            str: subFlowToParse,
            fromIndex: fromIndex,
            toIndex,
            chars: [',', ':'],
          });

          const improveDisplayName = compose(
            nodeToDisplayName,
            displayNameToNode,
          );
          const displayName = improveDisplayName(
            subFlowToParse.slice(fromIndex, displayNameEndIndex),
          );

          if (!displayNameToIndexes.hasOwnProperty(displayName)) {
            const newNode = {
              ...displayNameToNode(displayName),
              childrenIndexes: [],
              parentsIndexes,
            };

            currentGraphArray.push(newNode);
            displayNameToIndexes[displayName] = currentGraphArray.length - 1;
          }

          const nodeIndex = displayNameToIndexes[displayName];

          parentsIndexes
            .filter(i => !currentGraphArray[i].childrenIndexes.includes(nodeIndex))
            .forEach(i => currentGraphArray[i].childrenIndexes.push(nodeIndex));

          parentsIndexes
            .filter(i => !currentGraphArray[nodeIndex].parentsIndexes.includes(i))
            .filter(i => currentGraphArray[nodeIndex].parentsIndexes.push(i));

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
      toIndex: subFlowToParse.length - 1,
      parentsIndexes: [],
      newHeadsIndexes: [],
    });

    return currentGraphArray;
  };

export function findCloseAfterOpenParenthesesIndex(str, from, to) {
  let balance = 1; // positive balance means we have seen more open then closed parentheses.
  for (let i = from; i <= to; i++)
    if (str[i] === '[') balance++;
    else if (str[i] === ']')
      if (balance === 1) return i;
      else balance--;
  return -1;
}

export const findCharIndex = ({str, fromIndex, toIndex, chars}) => {
  for (let i = fromIndex; i <= toIndex; i++) if (chars.includes(str[i])) return i;
  return toIndex + 1;
};
