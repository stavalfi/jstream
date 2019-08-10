---
id: syntax
title: Syntax
sidebar_label: Syntax
---

_Parser_ can be used as a mathematical tool to generate graphs
from simple text. It has a minimal and powerful syntax which
takes the advantage of reprinting patterns inside your graph
to minimize the actual description of it.

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

> **Definition 1.1.** A [_simple graph_](https://proofwiki.org/wiki/Definition:Simple_Graph) is a graph which is;
>
> - Not a multigraph, i.e. there is no more than one edge between each pair of vertices;
> - Not a loop-graph, i.e. there are no loops, that is, edges which start and end at the same vertex;

> **Definition 1.2. ** A **_Flow_** is a _directed-simple graph_ with a single entry-point (head) such that there is a path from the fist node to every other node in the graph (there may not be a path from every node to any other node).

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

To give each node a unique key, a prefix will be added to every
node - the flow's name (if there is):

```
name: flow0
flow0/a -> flow0/b -> flow0/c
```

## Composition

A _flow_ can contain multiple flows just by naming them as a ragular nodes
in the graph. The parser will find those flows in the graph and replace
them with all their nodes.

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

There is only one problem in the above example, if `flow0` contains multiple
nodes, which node from `flow0` did you intend to be the bridge between
those flows? To solve this problem, we will need to tell the _parser_ who is that node:

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

The above example , will produce a graph representation for
every flow. Our nameless-flow will look like this:

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

To be more precise, the _parser_ will create a flow object for every node
that he didn't see yet. The reason is for being able to reuse flows
that you already defined.

For the above example, the _parser_ will create the following flows,
each with it's graph: _a_,_b_,_flow0_,_c_,_flow1_, nameless-flow (`flow0:flow1`).

You can even change the "default_path" while defining the last
flow by explicitly specifing it:

| _flow_          | actual graph                             | notes                     |
| --------------- | ---------------------------------------- | ------------------------- |
| `flow0/a:flow1` | `flow0/a -> flow0/b, flow0/a -> flow1/c` | same as the first output  |
| `flow0/b:flow1` | `flow0/a -> flow0/b -> flow1/c`          | same as the second output |

## Auto-filling / Auto-inferring

The _parser_ can receive a graph with references to other flows and
it will build the output graph based on those flows.

Let's have a look at this _parser-configuration_:

```json
[
  {
    "name": "flow0",
    "graph": "a:b:c",
    "default_path": "c"
  },
  {
    "name": "flow1",
    "graph": "d:e:f",
    "default_path": "f"
  },
  "flow0:a:flow1"
]
```

`"flow0:a:flow1"` will produce the following graph:

```
flow0/a -> flow0/b -> flow0/c -> a -> flow1/d -> flow1/e -> flow1/f
```

while `"flow0:a:flow1/a"`, `"flow0:a:flow1/b"`, `"flow0:a:flow1/c"` will
not produce different graph compired to `"flow0:a:flow1"`.
That is because the `<flow-1>/<flow-2>:<flow-3>` syntax means - build `<flow-1>` but
replace it's `default_path` to be equal to `<flow-2>`.
It means that the node that is linking
between `<flow-1>/<flow-2>` and `<flow-3>` is `<flow-2>` inside `<flow-1>`.

If we won't provide `<flow-2>`, we don't tell what is
the next node/flow we want a edge to. so this syntax,
in this case, will not have any effect:

if the graph (or the last node in the graph) is `<flow-1>/<flow-2>:<flow-3>`,
then `<flow-1>/<flow-2>` equals to `<flow-1>`.

Note: You need to remember that for every flow you define in the _parser-configuration_,
there will be only a single entry point. Also, if a graph contains multiple flows,
each flow will still have a single entry point; inside every graph, no flow is
allowed to pass edges from any node inside `<flow-1>` to any
internal (non-head) nodes of `<flow-2>`.

For example, for the following flows:

```json
[
  {
    "name": "flow0",
    "graph": "a:b:c",
    "default_path": "c"
  },
  {
    "name": "flow1",
    "graph": "d:e:f",
    "default_path": "f"
  }
]
```

The _parser_ can't produce a new flow based on _flow0_ and _flow1_ such that flow0
will have an edge to `flow1/e` nor `flow1/f`. If you want that, you will
need to use directly _e_ and _f_ or define a composition over them (or manually
and explicitly define all the nodes in the graph).

Note: You can use any other string instead of `/` by specify it in the head of the
parser configuration:

```json
{
  "splitters": {
    "extends": "_!!!_"
  },
  "flows": [
    {
      "name": "flow1",
      "graph": "a:b",
      "default_path": "b"
    },
    "a:b:c:d:flow1_!!!_b:a"
  ]
}
```

## Extending (Expending)

The _parser_ can create flow which will extend other flow.

```json
{
  "name": "flow0",
  "graph": "a:b:c",
  "default_path": "c",
  "extends_flows": ["d:e"]
}
```

`"d:e"` will produce the following graph: (which node extends `flow0`)

```
d/flow0/a -> d/flow0/b -> d/flow0/c -> e/flow0/a -> e/flow0/a -> e/flow0/a
```

As you can see, `"default_path": "c"` has an important role; `"default_path": "c"` defined
which node in the extended `d` will have edge to the head of the extended `e`.

Note: A flow can extend only a single flow.
