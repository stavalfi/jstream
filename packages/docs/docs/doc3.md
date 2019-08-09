---
id: doc3
title: Parser API
sidebar_label: Parser API
---

The real power comes from the result of the parsing. You will get everything you need to use the graphs as you wish.

The following is the parsed configuration of the following code:

```typescript
import { parse } from '@jstream/parser'
console.log(parse('flow1'))
```

```json
{
  "splitters": {
    "extends": "/"
  },
  "flows": [
    {
      "id": "4623",
      "name": "flow1",
      "defaultNodeIndex": 0,
      "graph": [
        {
          "path": ["flow1"],
          "childrenIndexes": [],
          "parentsIndexes": []
        }
      ],
      "pathsGroups": [["4624"]]
    }
  ]
}
```

```typescript
// https://stackoverflow.com/questions/56877697/get-all-combinations-of-a-type/56877972#56877972
// type Combinations = all combinations of a type (including an empty type)

export type ParsedFlow = {
  id: string
  graph: {
    path: string[]
    childrenIndexes: number[]
    parentsIndexes: number[]
  }[]
  pathsGroups: string[][]
} & (Combinations<{
  name: string
  extendedFlowIndex: number
  defaultNodeIndex: number
}>)
```

---

`id` - in _production_ build of the _parser_ library, it will be a valid
uui-id using _uuid_ library. For development builds of the _parser_
library, it will be an incremented numbers (for better debugging).
Unless you are a contribe to this library right now, you will work
with uuids.

---

`name` - the name of the flow. If you didn't provide a name, _parser_ will try to infer the name:

If the graph has a single node, _parser_ will check if there isn't an
already defined flow with that node-name. if not, the name of this
flow will be equal to it's single node's name.

---

`defaultNodeIndex` - _parser_ will infer (if possible) the default-node
that will be used when using this flow in other flows. For example:

```json5
[
  {
    name: 'flow1',
    graph: 'a:b',
    default_path: 'b',
  },
  'flow1:flow2', // same as "flow1/b:flow2
]
```

`flow1` will be parse to:

```json5
{
  id: '5029',
  name: 'flow1',
  defaultNodeIndex: 1,
  graph: [
    {
      path: ['flow1', 'a'],
      childrenIndexes: [1],
      parentsIndexes: [],
    },
    {
      path: ['flow1', 'b'],
      childrenIndexes: [],
      parentsIndexes: [0],
    },
  ],
  // ...
}
```

We specified that `b` will be the default node when writing `flow1` in other flows. so `flow1` equals to `flow1/b`. `flow1/b`'s index (`defaultNodeIndex`) is `1`.

The infering algorithm can do much more than that. For more information about `default_path`, please read in the docs.

---

`graph` - an array of nodes.

Each node contains:

`path` - contains all the flows that this node is a member in. `path[0]` will contain the flow's name if it has one.
`childrenIndexes` - children node indexes.
`parentsIndexes` - parents node indexes.

---

`pathsGroups` - This feature is the opposite of the `path` property of each node.
while the `path` of each nodes tells me which flows a node belongs,
this feature tells us which nodes each **appearance** of a flow consist.

Each node belongs to multiple flows. the name of those flows is listed in the `node.path` array. Let's have a look at the following configuration:

```json
[
  {
    "name": "base",
    "graph": "base1:base2",
    "default_path": "base2",
    "extends_flows": [
      {
        "name": "flow1",
        "graph": "a:b",
        "default_path": "b"
      },
      {
        "name": "flow2",
        "graph": "c:d",
        "default_path": "d"
      },
      "flow1:flow2"
    ]
  }
]
```

`"flow1:flow2"` produce the following graph:

![](https://i.imgur.com/onmgrUb.png)

Let's have a different look at this graph:

![](https://i.imgur.com/Bjd3Os2.jpg)

At the above image, we see nodes and edges as the last image but we also
see which flows, each node belongs in a clear way.

For example, node `l` belongs to flows: `base`, `base1`, `flow1`, `a`.
if we convert each of those flows to numbers, then this node belogs
to flows: `[1,2,3,4]` (the order of this array is important; from the top
most flow to the most inner flow).

If we create an array such that each cell will be an array representing
the numbers of the flows as we just did, we will get the following matrix:

![](https://i.imgur.com/QIytfC0.jpg)

At this point we can conclude the followings:

1. Each flow may appear multiple times at the same flow.
   For example. `flow2` appears multiple times in `base`.
2. With the help of the `graph` array and the node's
   `childrenIndexes` and `parentsIndexes`, we can know which nodes
   belongs to each appearance of each flow. For example, `flow2` appears 2 times at the graph:
   - The nodes _lll_,_lV_ are members of the first appearance of `flow2` in the graph.
   - The nodes _Vll_,_lX_ are members of the second appearance of `flow2` in the graph.

Still, there are alot of questions to answer, but first let's talk about one
practical use case of this feature:

_flower_ package is a redux-extentsion for managing functions.
Every node can be a function. If a fucntion is async, we can run the same function
multiple times concurrently. But how can we contorl the concurrency level of each
function? Well, thats easy. As every node belongs to multiple flows, so is a function.
All we have to do it to specify every flow's max-concurrency-level and with
the help of `pathsGroups`, we can know how much functions
(different and the same functions) we are running at the
same time in every appearance of every flow (remmber: `pathsGroups` will give us the
abolity to know which functions belongs to a specific appearance of a specific flow).
  
Implementations notes about `pathsGroups`:

- The numbers in the last image will be replaced by *uuid*s in production build of _parser_.
- The same numbers (dev build of parser)/ uuids (prod build of parser) will be given to
  every different appearance of every flow - same as the image above:
  Each appearance of _flow2_ received a different number.
- You may think that `pathsGroups` can be generated, also, by creating a matrix from all
  the node's _path_ property. Well, you can't. First of all, `pathsGroups` can tell you
  where are the different appearance of every flow while you can't get it in other ways.
  Secondly, `pathsGroups`gives the same appearance of every flow the same unique _uuid_
  so you can know where it start and where it ends. (to know where it start: go
  to the parent recorsivly and stop when you are looking at a node that it's
  value in `pathsGroups` is different then all the values of it's parents
  in `pathsGroups` - thats because every flow has a **_single_** entry point!).
  For more explaination, please open a github issue/ contact me in other ways.
