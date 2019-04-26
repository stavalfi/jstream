import _escapeRegExp from 'lodash/escapeRegExp';
import kindof from 'kindof';

export const distractDisplayNameBySplitters = (splitters, displayName) => {
  const identifierSplitterStartIndex = splitters.identifier
    ? displayName.indexOf(splitters.identifier)
    : -1;

  const identifierObject = identifierSplitterStartIndex > -1 && {
    identifier: displayName.split(splitters.identifier)[1],
  };

  const displayNameOnlyFlows =
    identifierSplitterStartIndex > -1
      ? displayName.slice(0, identifierSplitterStartIndex)
      : displayName;

  const partialPath = displayNameOnlyFlows.split(splitters.extends);

  return {
    partialPath,
    ...identifierObject,
  };
};

export const extractUniqueFlowsNamesFromGraph = splitters =>
  function extract(graph) {
    if (kindof(graph) !== 'array') {
      return extract([graph]);
    }
    const result = graph.flatMap(subGraph => {
      const savedWords = [',', ':', '[', ']'].map(_escapeRegExp).join('|');
      const regex = new RegExp(savedWords, 'g');
      const displayNames = subGraph.split(regex);
      const results = displayNames
        .map(displayName => {
          const {partialPath} = distractDisplayNameBySplitters(splitters, displayName);
          return partialPath[0];
        })
        .filter(displayName => displayName.length > 0);
      return results;
    });
    return [...new Set(result)];
  };

export const graphNodeToDisplayName = splitters => flowNode => {
  if (flowNode.path.length === 1) {
    return flowNode.path[0];
  }
  const flows = flowNode.path.join(splitters.extends);
  if (flowNode.identifier) {
    return `${flows}${splitters.identifier}${flowNode.identifier}`;
  } else {
    return flows;
  }
};

export const displayNameToFullGraphNode = splitters => (
  parsedFlows,
  flowName,
  extendedParsedFlow,
) => displayName => {
  const {partialPath, identifier} = distractDisplayNameBySplitters(splitters, displayName);
  const path = fillUserPath(parsedFlows, flowName, extendedParsedFlow, partialPath);
  return {
    path,
    ...(identifier && {identifier}),
  };
};

export const excludeExtendedFlows = (path, extendedParsedFlow) =>
  extendedParsedFlow
    ? path.filter(flowName => !extendedParsedFlow.graph.some(node => node.path.includes(flowName)))
    : path;

const onlyIncludeExtendedFlows = (path, extendedParsedFlow) =>
  extendedParsedFlow
    ? path.filter(flowName => extendedParsedFlow.graph.some(node => node.path.includes(flowName)))
    : [];

function fillUserPath(parsedFlows, flowName, extendedParsedFlow, userPath) {
  let newPath = flowName ? [flowName] : [];
  const filteredUserPath = userPath[0] === flowName ? userPath.slice(1) : userPath;

  const subPathNotExtendedFlows = excludeExtendedFlows(filteredUserPath, extendedParsedFlow);
  const subPathExtendedFlows = onlyIncludeExtendedFlows(filteredUserPath, extendedParsedFlow);

  if (subPathNotExtendedFlows.length > 0) {
    const parsedFlow = parsedFlows.find(
      parsedFlow => parsedFlow.name === subPathNotExtendedFlows[0],
    );

    const isExtendingTheSameFlow = (() => {
      if (extendedParsedFlow) {
        const extended = parsedFlow.extendedParsedFlow;
        while (extended) {
          if (extended.name === extendedParsedFlow.name) {
            return true;
          }
        }
      }
      return false;
    })();
    const options = parsedFlow.graph
      .map(node => node.path)
      .filter(path =>
        isSubsetOf(isExtendingTheSameFlow ? filteredUserPath : subPathNotExtendedFlows, path),
      );
    if (options.length === 1) {
      newPath = newPath.concat(options[0]);
    } else {
      newPath = newPath.concat(parsedFlow.graph[parsedFlow.defaultNodeIndex].path);
    }

    if (isExtendingTheSameFlow) {
      return newPath;
    }
  }

  if (extendedParsedFlow) {
    const options = extendedParsedFlow.graph
      .map(node => node.path)
      .filter(path => isSubsetOf(subPathExtendedFlows, path));
    if (options.length === 1) {
      newPath = newPath.concat(options[0]);
    } else {
      newPath = newPath.concat(extendedParsedFlow.graph[extendedParsedFlow.defaultNodeIndex].path);
    }
  }

  return newPath;
}

export function isSubsetOf(subsetPath, fullPath) {
  let i = 0,
    j = 0;
  while (i <= j && i < subsetPath.length && j < fullPath.length) {
    if (subsetPath[i] === fullPath[j]) {
      i++;
      j++;
    } else {
      j++;
    }
  }
  return i === subsetPath.length;
}

export const arePathsEqual = (path1, path2) => {
  if (path1.length !== path2.length) {
    return false;
  }
  for (let i = 0; i < path1.length; i++)
    if (path1[i] !== path2[i]) {
      return false;
    }
  return true;
};