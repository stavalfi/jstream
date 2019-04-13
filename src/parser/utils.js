import _escapeRegExp from 'lodash/escapeRegExp';
import kindof from 'kindof';
import {arePathsEqual} from './fix-flow-graph';

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

function fillUserPath(parsedFlows, flowName, extendedParsedFlow, userPath) {
  userPath = userPath[0] === flowName ? userPath.slice(1) : userPath;
  const newPath = flowName ? [flowName] : [];
  const parsedFlow =
    parsedFlows.find(parsedFlow => userPath.length > 0 && parsedFlow.name === userPath[0]) ||
    extendedParsedFlow;
  if (!parsedFlow) {
    return newPath;
  }
  const options = parsedFlow.graph
    .map(node => node.path)
    .filter(path => isSubsetOf(userPath, path));
  if (options.length > 1) {
    const lastParsedFlow = (() => {
      const lastFlowName = userPath[userPath.length - 1];
      const lastParsedFlow = parsedFlows.find(parsedFlow => parsedFlow.name === lastFlowName);
      if (lastParsedFlow) {
        return lastParsedFlow;
      } else {
        let extended = extendedParsedFlow;
        while (extended.name !== lastFlowName) {
          extended = extended.extendedParsedFlow;
        }
        return extended;
      }
    })();
    if (lastParsedFlow.graph.length > 1) {
      const defaultFlowName = (() => {
        let parsedFlow = lastParsedFlow;
        while (!parsedFlow.hasOwnProperty('defaultFlowName')) {
          parsedFlow = parsedFlow.extendedParsedFlow;
        }
        return parsedFlow.defaultFlowName;
      })();
      const path = options.find(path => path.includes(defaultFlowName));
      return [...newPath, ...path];
    } else {
      const path = options.find(path => isSubsetOf(lastParsedFlow.graph[0].path, path));
      return [...newPath, ...path];
    }
  } else {
    return [...newPath, ...options[0]];
  }
}

function isSubsetOf(subsetPath, fullPath) {
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

export function graphByIndexesToObjects(graph) {
  const extendedNodeGraph = graph
    .map(pos => {
      const subFlowIdObject = pos.subFlowId && {subFlowId: pos.subFlowId};
      const identifierObject = pos.identifier && {identifier: pos.identifier};
      return {
        ...identifierObject,
        path: pos.path,
        ...subFlowIdObject,
        children: [],
        parents: [],
      };
    })
    .map((pos, j, array) => {
      pos.parents = graph[j].parentsIndexes.map(parentIndex => array[parentIndex]);
      pos.children = graph[j].childrenIndexes.map(childIndex => array[childIndex]);
      return pos;
    });

  return extendedNodeGraph[0];
}

export function areNodesOnSameFlow(parsedFlows, parent, node) {
  if (parent.identifier !== node.identifier) {
    return false;
  }
  if (parent.path.length === 0 || node.path.length === 0) {
    return false;
  }
  if (parent.path[0] !== node.path[0]) {
    return false;
  }
  if (arePathsEqual(parent.path, node.path)) {
    return false;
  }

  function fixPath(parsedFlow, path) {
    // if parsedFlow is composed-flow then the flow-name doesn't appear in the graph of parsedFlow
    // so the flow-name shouldn't be part of the `path` array.
    const uniqueFlowsInFlow = [...new Set(parsedFlow.graph.map(node => node.path[0]))];
    return parsedFlow.name && uniqueFlowsInFlow.length > 1 && path[0] === parsedFlow.name
      ? path.slice(1)
      : path;
  }

  const parentFlowName = parent.path[0];
  const parentFlow = parsedFlows.find(parsedFlow => parsedFlow.name === parentFlowName);
  if (!parentFlow) {
    return areNodesOnSameFlow(
      parsedFlows,
      {...parent, path: parent.path.slice(1)},
      {...node, path: node.path.slice(1)},
    );
  }
  const parentPath = fixPath(parentFlow, parent.path);
  const nodePath = fixPath(parentFlow, node.path);
  const graph = parentFlow.graph;
  const parentIndex = graph.findIndex(pos => arePathsEqual(pos.path, parentPath));

  const visited = new Map();
  visited.set(parentIndex, true);

  function isNodeChildOfParent(i) {
    if (!visited.get(i)) {
      visited.set(i, true);
      if (arePathsEqual(graph[i].path, nodePath)) {
        return true;
      }
      return graph[i].childrenIndexes.filter(i => !visited.get(i)).some(isNodeChildOfParent);
    } else {
      return false;
    }
  }

  const result = graph[parentIndex].childrenIndexes.some(isNodeChildOfParent);
  return result;
}

export function groupGraphByFlows(parsedFlows, head) {
  const initialFlowId = 0;
  let subFlowId = initialFlowId;
  let stack = [head];
  const flowMembersByFlowId = new Map();
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node.hasOwnProperty('subFlowId')) {
      const parentFromSameFlow = node.parents.find(parent =>
        areNodesOnSameFlow(parsedFlows, parent, node),
      );
      if (parentFromSameFlow && parentFromSameFlow.hasOwnProperty('subFlowId')) {
        node.subFlowId = parentFromSameFlow.subFlowId;
        flowMembersByFlowId.get(node.subFlowId).push(node);
      } else {
        node.subFlowId = subFlowId;
        flowMembersByFlowId.set(node.subFlowId, [node]);
        subFlowId++;
      }
      stack = [...node.children, ...stack];
    }
  }
  return {
    initialFlowId,
    flowMembersByFlowId,
  };
}

export function transformToArrayGraph(head) {
  const visited = new Map();
  const graph = [];
  let i = 0;

  function addIndexes(pos) {
    if (!visited.get(pos)) {
      visited.set(pos, true);
      graph.push(pos);
      pos.index = i++;
      pos.children.filter(child => !visited.get(child)).forEach(child => addIndexes(child));
    }
  }

  addIndexes(head);

  return graph.map(node => {
    const identifierObject = node.identifier && {identifier: node.identifier};
    return {
      ...identifierObject,
      path: node.path,
      childrenIndexes: node.children.map(child => child.index),
      parentsIndexes: node.parents.map(parent => parent.index),
    };
  });
}
