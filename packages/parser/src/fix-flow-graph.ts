import { arePathsEqual } from '@parser/utils'
import { AlgorithmParsedFlow, Graph, Node, ParsedUserFlow, Path, Splitters, UserFlowObject } from '@parser/types'
import { uuid } from '@jstream/utils'

type AlgorithmNode = {
  path: Path
  children: AlgorithmNode[]
  parents: AlgorithmNode[]
  index?: number
  newGroupId: string
}

type FixAndExtendGraph = (params: {
  splitters: Splitters
  parsedFlows: AlgorithmParsedFlow[]
  flowToParse: ParsedUserFlow
  parsedGraph: Graph
  extendedParsedFlow?: AlgorithmParsedFlow
}) => Graph
export const fixAndExtendGraph: FixAndExtendGraph = ({
  splitters,
  parsedFlows,
  flowToParse,
  parsedGraph,
  extendedParsedFlow,
}) => {
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

  const copiedParsedGraph = parsedGraph.map(node => ({ ...node, oldGroupIndex: -1 }))

  const differentFlowNames = copiedParsedGraph
    .reduce(
      (
        { acc, oldGroupIndex }: { acc: { flowName: string; oldGroupIndex: number }[]; oldGroupIndex: number },
        node,
        i,
      ) => {
        const flowName = getUsedFlowName(flowToParse)(node.path)
        const group = acc.find(group => group.flowName === flowName)
        if (i === 0 || !group) {
          node.oldGroupIndex = oldGroupIndex
          return { acc: [...acc, { flowName, oldGroupIndex }], oldGroupIndex: oldGroupIndex + 1 }
        } else {
          node.oldGroupIndex = group.oldGroupIndex
          return { acc, oldGroupIndex }
        }
      },
      { acc: [], oldGroupIndex: 0 },
    )
    .acc.map(group => group.flowName)

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
    .map(parsedFlow => {
      const id = uuid()
      return {
        ...parsedFlow,
        graph: parsedFlow.graph.map(node => ({
          ...node,
          newGroupId: id,
        })),
      }
    })
    .map(parsedFlow => ({
      ...parsedFlow,
      graph: graphByIndexesToObjects(parsedFlow.graph),
    }))
    .map(parsedFlow => extendGraph(extendedParsedFlow)(parsedFlow))

  const getNewNode = (oldGroupIndex: number, oldNode: Node): AlgorithmNode => {
    const newGraph = extendedFlowsInGraphByFlowName[oldGroupIndex]
    return newGraph.find(node => arePathsEqual(node.path, oldNode.path)) as (AlgorithmNode)
  }

  // link the nodes as the user explicitly specified
  for (const oldNode of copiedParsedGraph) {
    const flowNameNode = getUsedFlowName(flowToParse)(oldNode.path)
    const newNode = getNewNode(oldNode.oldGroupIndex, oldNode)
    oldNode.childrenIndexes
      .map(i => copiedParsedGraph[i])
      .forEach(oldChid => {
        const flowNameChild = getUsedFlowName(flowToParse)(oldChid.path)
        if (flowNameNode === flowNameChild) {
          // add new links betwen the same sub-flow
          const newChild = getNewNode(oldChid.oldGroupIndex, oldChid)
          tryAddLink({
            fromNode: newNode,
            toNode: newChild,
          })
        } else {
          // link between different sub-flows
          const headOfNewChildGraph = extendedFlowsInGraphByFlowName[oldChid.oldGroupIndex][0]
          // note: if the link is between node to internal node in other sub-flow, only link to the head of that other sub-flow
          tryAddLink({
            fromNode: newNode,
            toNode: headOfNewChildGraph,
          })
        }
      })
  }

  return transformToArrayGraph(extendedFlowsInGraphByFlowName[copiedParsedGraph[0].oldGroupIndex][0])
}

const tryAddLink = ({ fromNode, toNode }: { fromNode: AlgorithmNode; toNode: AlgorithmNode }): void => {
  if (!fromNode.children.includes(toNode)) {
    fromNode.children.push(toNode)
    toNode.parents.push(fromNode)
  }
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

  const newGroupId = parsedFlow.graph[0].newGroupId

  for (const oldNode of parsedFlow.graph) {
    const extendedFlowMember = extendedParsedFlow.graph
      .map(pos => ({
        path: [...oldNode.path, ...pos.path],
        children: [],
        parents: [],
        newGroupId,
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

function graphByIndexesToObjects(graph: (Node & { newGroupId: string })[]): AlgorithmNode[] {
  return graph
    .map(pos => ({
      path: pos.path,
      children: [],
      parents: [],
      newGroupId: pos.newGroupId,
    }))
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
