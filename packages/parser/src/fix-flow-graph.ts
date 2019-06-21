import { arePathsEqual } from 'utils'
import { AlgorithmParsedFlow, Graph, Node, Path, UserFlowObject } from 'types'

type AlgorithmNode = {
  path: Path
  children: AlgorithmNode[]
  parents: AlgorithmNode[]
  index?: number
  identifier?: string
}

type FixAndExtendGraph = ({
  parsedFlows,
  flowToParse,
  parsedGraph,
  extendedParsedFlow,
}: {
  parsedFlows: AlgorithmParsedFlow[]
  flowToParse: UserFlowObject
  parsedGraph: Graph
  extendedParsedFlow?: AlgorithmParsedFlow
}) => Graph
export const fixAndExtendGraph: FixAndExtendGraph = ({ parsedFlows, flowToParse, parsedGraph, extendedParsedFlow }) => {
  if (
    parsedGraph.length === 1 &&
    parsedGraph[0].path.length === 1 &&
    'name' in flowToParse &&
    parsedGraph[0].path[0] === flowToParse.name
  ) {
    if (extendedParsedFlow) {
      return extendedParsedFlow.graph.map(node => ({
        ...node,
        path: [flowToParse.name, ...node.path],
      }))
    } else {
      return parsedGraph
    }
  }

  const copiedParsedGraph = parsedGraph.map(node => ({ ...node, groupIndex: -1 }))

  const differentFlowNames = copiedParsedGraph.reduce(
    ({ acc, groupIndex }: { acc: string[]; groupIndex: number }, node, i) => {
      const flowName = getUsedFlowName(flowToParse)(node.path)
      if (i === 0 || acc[groupIndex - 1] !== flowName) {
        node.groupIndex = groupIndex
        return { acc: [...acc, flowName], groupIndex: groupIndex + 1 }
      } else {
        node.groupIndex = groupIndex - 1
        return { acc, groupIndex }
      }
    },
    { acc: [], groupIndex: 0 },
  ).acc

  if (
    differentFlowNames.length === 1 &&
    extendedParsedFlow &&
    'name' in extendedParsedFlow &&
    differentFlowNames[0] === extendedParsedFlow.name
  ) {
    return extendedParsedFlow.graph.map(node => ({
      ...node,
      path: 'name' in flowToParse ? [flowToParse.name, ...node.path] : node.path,
    }))
  }

  const extendedFlowsInGraphByFlowName = differentFlowNames
    .map(
      flowName =>
        parsedFlows.find(parsedFlow => 'name' in parsedFlow && parsedFlow.name === flowName) as AlgorithmParsedFlow,
    )
    .map(parsedFlow => ({
      ...parsedFlow,
      graph: parsedFlow.graph.map(addFlowName(flowToParse)),
    }))
    .map(parsedFlow => ({
      ...parsedFlow,
      graph: graphByIndexesToObjects(parsedFlow.graph),
    }))
    .map(parsedFlow => extendGraph(extendedParsedFlow)(parsedFlow))

  const getNewNode = (groupIndex: number, oldNode: Node): AlgorithmNode => {
    const newGraph = extendedFlowsInGraphByFlowName[groupIndex]
    return newGraph.find(node => arePathsEqual(node.path, oldNode.path)) as AlgorithmNode
  }

  for (const oldNode of copiedParsedGraph) {
    const flowNameNode = getUsedFlowName(flowToParse)(oldNode.path)
    const newNode = getNewNode(oldNode.groupIndex, oldNode)
    oldNode.childrenIndexes
      .map(i => copiedParsedGraph[i])
      .forEach(oldChid => {
        const flowNameChild = getUsedFlowName(flowToParse)(oldChid.path)
        if (flowNameNode === flowNameChild) {
          const newChild = getNewNode(oldChid.groupIndex, oldChid)
          if (!newNode.children.includes(newChild)) {
            newNode.children.push(newChild)
            newChild.parents.push(newNode)
          }
        } else {
          const headOfNewChildGraph = extendedFlowsInGraphByFlowName[oldChid.groupIndex][0]
          if (!newNode.children.includes(headOfNewChildGraph)) {
            newNode.children.push(headOfNewChildGraph)
            headOfNewChildGraph.parents.push(newNode)
          }
        }
      })
  }

  return transformToArrayGraph(extendedFlowsInGraphByFlowName[copiedParsedGraph[0].groupIndex][0])
}

const getUsedFlowName = (flowToParse: UserFlowObject) => (path: Path) => {
  if (path.length > 1) {
    if (flowToParse.hasOwnProperty('name')) {
      return path[1]
    } else {
      return path[0]
    }
  } else {
    return path[0]
  }
}

const addFlowName = (flowToParse: UserFlowObject) => (node: Node): Node => {
  return 'name' in flowToParse ? { ...node, path: [flowToParse.name, ...node.path] } : node
}

const extendGraph = (extendedParsedFlow?: AlgorithmParsedFlow) => (
  parsedFlow: Omit<AlgorithmParsedFlow, 'graph'> & { graph: AlgorithmNode[] },
): AlgorithmNode[] => {
  if (!extendedParsedFlow) {
    return parsedFlow.graph
  }
  // @ts-ignore https://github.com/microsoft/TypeScript/issues/32030
  if ('extendedParsedFlow' in parsedFlow && parsedFlow.extendedParsedFlow.id === extendedParsedFlow.id) {
    return parsedFlow.graph
  }

  const oldToExtended: Map<AlgorithmNode, AlgorithmNode[]> = new Map()

  for (const oldNode of parsedFlow.graph) {
    const extendedFlowMember = extendedParsedFlow.graph
      .map(pos => ({
        path: [...oldNode.path, ...pos.path],
        children: [],
        parents: [],
      }))
      .map((pos: AlgorithmNode, j, array) => {
        pos.parents = extendedParsedFlow.graph[j].parentsIndexes.map(parentIndex => array[parentIndex])
        pos.children = extendedParsedFlow.graph[j].childrenIndexes.map(childIndex => array[childIndex])
        return pos
      })
    oldToExtended.set(oldNode, extendedFlowMember)
  }

  for (const oldNode of parsedFlow.graph) {
    const algorithmNodes = oldToExtended.get(oldNode)
    const newNode =
      'defaultNodeIndex' in extendedParsedFlow && algorithmNodes && algorithmNodes[extendedParsedFlow.defaultNodeIndex]
    newNode &&
      oldNode.children
        .map(oldChild => oldToExtended.get(oldChild))
        .filter(Boolean)
        .map(extended => (extended as AlgorithmNode[])[0])
        .forEach(newChild => {
          newNode.children.push(newChild)
          newChild.parents.push(newNode)
        })
  }

  // put new graph in array
  const newGraph = []
  const visited = new Map()

  const head = parsedFlow.graph[0]
  const extendedHeadGraph = oldToExtended.get(head) as AlgorithmNode[]
  let stack: AlgorithmNode[] = [extendedHeadGraph[0]]
  while (stack.length > 0) {
    const newNode = stack.pop() as AlgorithmNode
    if (!visited.get(newNode)) {
      visited.set(newNode, true)
      newGraph.push(newNode)
      stack = [...newNode.children, ...stack]
    }
  }

  return newGraph
}

function graphByIndexesToObjects(graph: Graph): AlgorithmNode[] {
  return graph
    .map(pos => {
      const identifierObject = pos.identifier && { identifier: pos.identifier }
      return {
        ...identifierObject,
        path: pos.path,
        children: [],
        parents: [],
      }
    })
    .map((pos: AlgorithmNode, j, array) => {
      pos.parents = graph[j].parentsIndexes.map(parentIndex => array[parentIndex])
      pos.children = graph[j].childrenIndexes.map(childIndex => array[childIndex])
      return pos
    })
}

function transformToArrayGraph(head: AlgorithmNode): Node[] {
  const visited = new Map()
  const graph: AlgorithmNode[] = []
  let i = 0

  function addIndexes(pos: AlgorithmNode) {
    if (!visited.get(pos)) {
      visited.set(pos, true)
      graph.push(pos)
      pos.index = i++
      pos.children.filter(child => !visited.get(child)).forEach(child => addIndexes(child))
    }
  }

  addIndexes(head)

  type WithIndex = {
    index: number
    path: Path
    children: WithIndex[]
    parents: WithIndex[]
    identifier?: string
  }

  const graphWithIndexes = graph as WithIndex[]
  return graphWithIndexes.map(node => {
    return {
      path: node.path,
      childrenIndexes: node.children.map(child => child.index),
      parentsIndexes: node.parents.map(parent => parent.index),
    }
  })
}
