---
id: doc1
title: Parser
sidebar_label: Parser
---

_Parser_ can be used as a mathematical tool to generate graphs from simple text. It has a minimal and powerful syntax which takes the advantage of reprinting patterns inside your graph to minimize the actual description of it.

We will start with a simple representaiton of the following graphs:

| _flow_            | actual graph                 | notes                                     |
| ----------------- | ---------------------------- | ----------------------------------------- |
| `a:b`             | `a->b`                       |                                           |
| `a:b:c`           | `a->b->c`                    |                                           |
| `a:b:a`           | `a<->b`                      |                                           |
| `a:b:a`           | `a<->b`                      |                                           |
| `a:b,c`           | `a->b, a->c`                 |                                           |
| `a:b,c:a`         | `a<->b, a->c`                |                                           |
| `a:b,c,d:e`       | `a->b, a->c, a->d, b,c,d->e` |                                           |
| `a:[b:c],d`       | `a->b->c, a->d`              | `[..]` will return the first defined node |
| `a:[b:c],[d:e]:f` | `a->b->c, a->d->e b,d->f`    |                                           |

---

Before we continue, Please use the [Live Editor]() for practice.

## Flow

> **Definition 1.1.** A [_directed simple graph_](https://proofwiki.org/wiki/Definition:Simple_Graph) is a graph which is;
>
> - Not a multigraph, i.e. there is no more than one edge between each pair of vertices;
> - Not a loop-graph, i.e. there are no loops, that is, edges which start and end at the same vertex;
> - Not a weighted graph, i.e. the edges are not mapped to a number.

> **Definition 1.2.** A **_Flow_** is a _directed-simple graph_ with a single entry-point (head) such that there is a path from the fist node to every other node in the graph (there may not be a path from every node to the head).

```typescript
type Flow = {
  name: string // optional
  graph: string | string[]
}
```

For example:

```json
{
  "name": "flow0",
  "graph": ["a:b", "b:c"] // same as "a:b:c"
}
```

```
name: flow0
a->b->c
```

To give each node a unique key, a prefix will be added to every node - the flow's name (if there is):

```
name: flow0
flow0/a -> flow0/b -> flow0/c
```

## Composition

A _flow_ can contain multiple flows just by naming them as a ragular nodes in the graph. The parser will find those flows in the graph and replace them with all their nodes.

```json
[
  {
    "name": "flow0"
    // ....
  },
  {
    "name": "flow1"
    // ....
  },
  {
    "name": "composed-flow",
    "graph": "flow0:flow1"
  }
]
```

There is only one problem inthe above example, if `flow0` contains multiple nodes, which node from `flow0` did you intend to be the bridge between those flows? To solve this problem, we will need to tell the _parser_ who is that node:

```json
[
  {
    "name": "flow0",
    "graph": "a:b",
    "default_path": "a"
  },
  {
    "name": "flow1",
    "graph": "c"
    // rule: if you have more than one node in a graph,
    //       "default_path" must be specified.
  },
  "flow0:flow1"
]
```

The above example, will produce a graph representation for every flow. Our nameless-flow will look like this:

```
flow0/a -> flow0/b
        \
         -> flow1/c
```

If we will change the `default_path` to `b`, it will look like this:

```
flow0/a -> flow0/b -> flow1/c
```

---

To be more precise, the _parser_ will create a flow object for every node that he didn't see yet. The reason is for being able to reuse flows that you already defined.

For the above example, the _parser_ will create the following flows, each with it's graph: _a_,_b_,_flow0_,_c_,_flow1_, nameless-flow (`flow0:flow1`).

You can even change the "default_path" while defining the last flow by explicitly specifing it:

| _flow_          | actual graph                             | notes                     |
| --------------- | ---------------------------------------- | ------------------------- |
| `flow0/a:flow1` | `flow0/a -> flow0/b, flow0/a -> flow1/c` | same as the first output  |
| `flow0/b:flow1` | `flow0/a -> flow0/b -> flow1/c`          | same as the second output |
