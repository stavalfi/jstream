import * as d3 from 'd3'
import { graphNodeToDisplayName } from '@jstream/parser'
import '@editor/styles.css'

function toNodes({ splitters, graph }) {
  return graph.map(graphNodeToDisplayName(splitters)).map(displayName => ({ id: displayName }))
}

function toLinks({ splitters, graph }) {
  return graph.flatMap(node =>
    node.childrenIndexes.map(target => ({
      source: graphNodeToDisplayName(splitters)(node),
      target: graphNodeToDisplayName(splitters)(graph[target]),
    })),
  )
}

export function updateChart({ svgReact, config, flow, height, width }) {
  ;[...svgReact.children].forEach(x => svgReact.removeChild(x))

  const nodes = toNodes({ splitters: config.splitters, graph: flow.graph })
  const links = toLinks({ splitters: config.splitters, graph: flow.graph })

  const graph = { nodes, links }

  const color = d3.scaleOrdinal(d3.schemeCategory10)

  drawD3(graph)

  function drawD3(graph) {
    const label = {
      nodes: [],
      links: [],
    }

    graph.nodes.forEach(function(d, i) {
      label.nodes.push({ node: d })
      label.nodes.push({ node: d })
      label.links.push({
        source: i * 2,
        target: i * 2 + 1,
      })
    })

    const labelLayout = d3
      .forceSimulation(label.nodes)
      .force('charge', d3.forceManyBody().strength(-50))
      .force(
        'link',
        d3
          .forceLink(label.links)
          .distance(0)
          .strength(1),
      )

    const graphLayout = d3
      .forceSimulation(graph.nodes)
      .force('charge', d3.forceManyBody().strength(-3000))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(1))
      .force('y', d3.forceY(height / 2).strength(1))
      .force(
        'link',
        d3
          .forceLink(graph.links)
          .id(function(d) {
            return d.id
          })
          .distance(100)
          .strength(1),
      )
      .on('tick', ticked)

    const adjlist = []

    graph.links.forEach(function(d) {
      adjlist[`${d.source.index}-${d.target.index}`] = true
      adjlist[`${d.target.index}-${d.source.index}`] = true
    })

    function neigh(a, b) {
      return a === b || adjlist[`${a}-${b}`]
    }

    const svg = d3
      .select(svgReact)
      .attr('width', x => {
        return width
      })
      .attr('height', height)

    svg
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')

    const container = svg.append('g')

    svg.call(
      d3
        .zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', function() {
          container.attr('transform', d3.event.transform)
        }),
    )

    const link = container
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graph.links)
      .enter()
      .append('line')
      .attr('stroke', '#aaa')
      .attr('stroke-width', '4px')
      .attr('marker-end', d => 'url(#arrow)')

    const node = container
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(graph.nodes)
      .enter()
      .append('circle')
      .attr('r', 20)
      .attr('fill', function(d) {
        return color(d.group)
      })

    node.on('mouseover', focus).on('mouseout', unfocus)

    node.call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended),
    )

    const labelNode = container
      .append('g')
      .attr('class', 'labelNodes')
      .selectAll('text')
      .data(label.nodes)
      .enter()
      .append('text')
      .text(function(d, i) {
        return i % 2 === 0 ? '' : d.node.id
      })
      .style('fill', '#555')
      .style('font-weight', 'bold')
      .style('font-family', 'Arial')
      .style('font-size', 16)
      .style('pointer-events', 'none') // to prevent mouseover/drag capture

    node.on('mouseover', focus).on('mouseout', unfocus)

    function ticked() {
      node.call(updateNode)
      link.call(updateLink)

      labelLayout.alphaTarget(0.3).restart()
      labelNode.each(function(d, i) {
        d.x = d.node.x
        d.y = d.node.y
      })
      labelNode.call(updateNode)
    }

    function fixna(x) {
      if (isFinite(x)) {
        return x
      }
      return 0
    }

    function focus(d) {
      const index = d3.select(d3.event.target).datum().index
      node.style('opacity', function(o) {
        return neigh(index, o.index) ? 1 : 0.1
      })
      labelNode.attr('display', function(o) {
        return neigh(index, o.node.index) ? 'block' : 'none'
      })
      link.style('opacity', function(o) {
        return o.source.index == index || o.target.index == index ? 1 : 0.1
      })
    }

    function unfocus() {
      labelNode.attr('display', 'block')
      node.style('opacity', 1)
      link.style('opacity', 1)
    }

    function updateLink(link) {
      link
        .attr('x1', function(d) {
          return fixna(d.source.x)
        })
        .attr('y1', function(d) {
          return fixna(d.source.y)
        })
        .attr('x2', function(d) {
          return fixna(d.target.x)
        })
        .attr('y2', function(d) {
          return fixna(d.target.y)
        })
    }

    function updateNode(node) {
      node.attr('transform', function(d) {
        return `translate(${fixna(d.x)},${fixna(d.y)})`
      })
    }

    function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation()
      if (!d3.event.active) {
        graphLayout.alphaTarget(0.3).restart()
      }
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(d) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    function dragended(d) {
      if (!d3.event.active) {
        graphLayout.alphaTarget(0)
      }
      d.fx = null
      d.fy = null
    }
  } // d3.json
}
