---
id: parser-example1
title: Parser Configuration - Example 1
sidebar_label: Example 1
---

A practical usecase to use the parser, is to represent a state machine of a function:

## Configuration

```json
{
  "splitters": {
    "extends": "/"
  },
  "flows": [
    {
      "name": "state",
      "graph": "should_start:failed,canceled,succeed,[waiting:failed,canceled,succeed]",
      "default_path": "succeed",
      "extends_flows": [
        {
          "name": "f3",
          "graph": "f1:f2" // same as "f1/succeed:f2"
        }
      ]
    }
  ]
}
```

## Graphs

The `state` flow:

```
state/should_start -> state/failed, state/canceled, state/waiting
               \                                         \   \    \
                \                                         \   \    -> state/failed
                 \                                         \   -> state/canceled
                  -------------------------------------------> state/succeed
```

`f1` (and `f2`):

```
f1/state/should_start -> f1/state/failed, f1/state/canceled, f1/state/waiting
               \                                                \   \    \
                \                                                \   \    -> f1/state/failed
                 \                                                \   -> f1/state/canceled
                  -------------------------------------------------> f1/state/succeed
```

`f3`:

```
f3/f1/state/should_start -> f3/f1/state/failed, f3/f1/state/canceled, f3/f1/state/waiting
               \                                                        \   \    \
                \                                                        \   \    -> f3/f1/state/failed
                 \                                                        \   -> f3/f1/state/canceled
                  ---------------------------------------------------------> f3/f1/state/succeed
                   \                                                                |
     --------------------------------------------------------------------------------
     \
      \
f3/f2/state/should_start -> f3/f2/state/failed, f3/f2/state/canceled, f3/f2/state/waiting
               \                                                        \   \    \
                \                                                        \   \    -> f3/f2/state/failed
                 \                                                        \   -> f3/f2/state/canceled
                  ---------------------------------------------------------> f3/f2/state/succeed
```

In the parsed-configuration, you have access to `f1`,`f2` and `f3` flows seperatly, fully defined for you.

## Parsed configuration

```json
{
  "splitters": {
    "extends": "/"
  },
  "flows": [
    {
      "id": "4537",
      "name": "should_start",
      "defaultNodeIndex": 0,
      "maxConcurrency": 1,
      "graph": [
        {
          "path": ["should_start"],
          "childrenIndexes": [],
          "parentsIndexes": []
        }
      ],
      "pathsGroups": [["4538"]],
      "sideEffects": [],
      "rules": []
    },
    {
      "id": "4539",
      "name": "failed",
      "defaultNodeIndex": 0,
      "maxConcurrency": 1,
      "graph": [
        {
          "path": ["failed"],
          "childrenIndexes": [],
          "parentsIndexes": []
        }
      ],
      "pathsGroups": [["4540"]],
      "sideEffects": [],
      "rules": []
    },
    {
      "id": "4541",
      "name": "canceled",
      "defaultNodeIndex": 0,
      "maxConcurrency": 1,
      "graph": [
        {
          "path": ["canceled"],
          "childrenIndexes": [],
          "parentsIndexes": []
        }
      ],
      "pathsGroups": [["4542"]],
      "sideEffects": [],
      "rules": []
    },
    {
      "id": "4543",
      "name": "succeed",
      "defaultNodeIndex": 0,
      "maxConcurrency": 1,
      "graph": [
        {
          "path": ["succeed"],
          "childrenIndexes": [],
          "parentsIndexes": []
        }
      ],
      "pathsGroups": [["4544"]],
      "sideEffects": [],
      "rules": []
    },
    {
      "id": "4545",
      "name": "waiting",
      "defaultNodeIndex": 0,
      "maxConcurrency": 1,
      "graph": [
        {
          "path": ["waiting"],
          "childrenIndexes": [],
          "parentsIndexes": []
        }
      ],
      "pathsGroups": [["4546"]],
      "sideEffects": [],
      "rules": []
    },
    {
      "id": "4559",
      "extendedFlowIndex": 8,
      "name": "f1",
      "defaultNodeIndex": 3,
      "maxConcurrency": 1,
      "graph": [
        {
          "path": ["f1", "state", "should_start"],
          "childrenIndexes": [1, 2, 3, 4],
          "parentsIndexes": []
        },
        {
          "path": ["f1", "state", "failed"],
          "childrenIndexes": [],
          "parentsIndexes": [0, 4]
        },
        {
          "path": ["f1", "state", "canceled"],
          "childrenIndexes": [],
          "parentsIndexes": [0, 4]
        },
        {
          "path": ["f1", "state", "succeed"],
          "childrenIndexes": [],
          "parentsIndexes": [0, 4]
        },
        {
          "path": ["f1", "state", "waiting"],
          "childrenIndexes": [1, 2, 3],
          "parentsIndexes": [0]
        }
      ],
      "pathsGroups": [
        ["4560", "4561", "4562"],
        ["4560", "4561", "4563"],
        ["4560", "4561", "4564"],
        ["4560", "4561", "4565"],
        ["4560", "4561", "4566"]
      ],
      "sideEffects": [],
      "rules": []
    },
    {
      "id": "4567",
      "extendedFlowIndex": 8,
      "name": "f2",
      "defaultNodeIndex": 3,
      "maxConcurrency": 1,
      "graph": [
        {
          "path": ["f2", "state", "should_start"],
          "childrenIndexes": [1, 2, 3, 4],
          "parentsIndexes": []
        },
        {
          "path": ["f2", "state", "failed"],
          "childrenIndexes": [],
          "parentsIndexes": [0, 4]
        },
        {
          "path": ["f2", "state", "canceled"],
          "childrenIndexes": [],
          "parentsIndexes": [0, 4]
        },
        {
          "path": ["f2", "state", "succeed"],
          "childrenIndexes": [],
          "parentsIndexes": [0, 4]
        },
        {
          "path": ["f2", "state", "waiting"],
          "childrenIndexes": [1, 2, 3],
          "parentsIndexes": [0]
        }
      ],
      "pathsGroups": [
        ["4568", "4569", "4570"],
        ["4568", "4569", "4571"],
        ["4568", "4569", "4572"],
        ["4568", "4569", "4573"],
        ["4568", "4569", "4574"]
      ],
      "sideEffects": [],
      "rules": []
    },
    {
      "id": "4577",
      "extendedFlowIndex": 8,
      "name": "f3",
      "maxConcurrency": 1,
      "graph": [
        {
          "path": ["f3", "f1", "state", "should_start"],
          "childrenIndexes": [1, 2, 3, 9],
          "parentsIndexes": []
        },
        {
          "path": ["f3", "f1", "state", "failed"],
          "childrenIndexes": [],
          "parentsIndexes": [0, 9]
        },
        {
          "path": ["f3", "f1", "state", "canceled"],
          "childrenIndexes": [],
          "parentsIndexes": [0, 9]
        },
        {
          "path": ["f3", "f1", "state", "succeed"],
          "childrenIndexes": [4],
          "parentsIndexes": [0, 9]
        },
        {
          "path": ["f3", "f2", "state", "should_start"],
          "childrenIndexes": [5, 6, 7, 8],
          "parentsIndexes": [3]
        },
        {
          "path": ["f3", "f2", "state", "failed"],
          "childrenIndexes": [],
          "parentsIndexes": [4, 8]
        },
        {
          "path": ["f3", "f2", "state", "canceled"],
          "childrenIndexes": [],
          "parentsIndexes": [4, 8]
        },
        {
          "path": ["f3", "f2", "state", "succeed"],
          "childrenIndexes": [],
          "parentsIndexes": [4, 8]
        },
        {
          "path": ["f3", "f2", "state", "waiting"],
          "childrenIndexes": [5, 6, 7],
          "parentsIndexes": [4]
        },
        {
          "path": ["f3", "f1", "state", "waiting"],
          "childrenIndexes": [1, 2, 3],
          "parentsIndexes": [0]
        }
      ],
      "pathsGroups": [
        ["4578", "4579", "4580", "4581"],
        ["4578", "4579", "4580", "4582"],
        ["4578", "4579", "4580", "4583"],
        ["4578", "4579", "4580", "4584"],
        ["4578", "4586", "4587", "4588"],
        ["4578", "4586", "4587", "4589"],
        ["4578", "4586", "4587", "4590"],
        ["4578", "4586", "4587", "4591"],
        ["4578", "4586", "4587", "4592"],
        ["4578", "4579", "4580", "4585"]
      ],
      "sideEffects": [],
      "rules": []
    },
    {
      "id": "4552",
      "name": "state",
      "defaultNodeIndex": 3,
      "maxConcurrency": 1,
      "graph": [
        {
          "path": ["state", "should_start"],
          "childrenIndexes": [1, 2, 3, 4],
          "parentsIndexes": []
        },
        {
          "path": ["state", "failed"],
          "childrenIndexes": [],
          "parentsIndexes": [0, 4]
        },
        {
          "path": ["state", "canceled"],
          "childrenIndexes": [],
          "parentsIndexes": [0, 4]
        },
        {
          "path": ["state", "succeed"],
          "childrenIndexes": [],
          "parentsIndexes": [0, 4]
        },
        {
          "path": ["state", "waiting"],
          "childrenIndexes": [1, 2, 3],
          "parentsIndexes": [0]
        }
      ],
      "pathsGroups": [["4553", "4554"], ["4553", "4555"], ["4553", "4556"], ["4553", "4557"], ["4553", "4558"]],
      "sideEffects": [],
      "rules": []
    }
  ]
}
```
