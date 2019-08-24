<h1 align="center">JStream</h1>
<p align="center">Represent graphs, differently</p>

[![Build Status](https://dev.azure.com/stavalfi/jstream/_apis/build/status/stavalfi.jstream?branchName=master)](https://dev.azure.com/stavalfi/jstream/_build/latest?definitionId=1&branchName=master)
[![Netlify Status](https://api.netlify.com/api/v1/badges/a2959f98-cdf7-4d0c-9526-e6e7e87632e7/deploy-status)](https://app.netlify.com/sites/jstream-editor/deploys)
[![CircleCI](https://circleci.com/gh/stavalfi/jstream.svg?style=svg)](https://circleci.com/gh/stavalfi/jstream)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/stavalfi/jstream)

## Table of Contents

1. [Install](#install)
2. [Introduction](#introduction)
3. [Concepts](#concepts)
4. [Contributing](#contributing)

<h2 align="center">Install</h2>

The redux extension:

```bash
yarn add @jstream/flower
```

For library creators who develops above the _parser_:

```bash
yarn add @jstream/parser
```

<h2 align="center">Introduction</h2>

#### Parser

Representing _big_ simple graphs with a single entry-point using minimal syntax.
The output of the _parser_ is a matrix-like representation of the
graph: for every node, there will be an array for children and
parent indexes (and much more).

Checkout the [live-editor](https://jstream-editor.netlify.com/)

#### Flower

Representing the state of complex flows using graphs and redux.
By defining each flow as a finite automaton, you will build
testable small functions that will be reused in other flows.

Goals:

- Guid you to write as much as predicatible small functions as possible.
- You won't marry with this library. Minimal interaction with our API
  will let you upgrade your code to a different one that suits your needs
  better - fast and easly.
- Keeping the implementstion frameworkless aware.

<h2 align="center">Concepts</h2>

##### Flow

> Simple directed graph with a single entry-point.

A graph can represent anything.

Under the _flower_ project, a graph will represent the state of a complex scenario using automaton:

```
do side-effect/something-else, then go to the appropriate node:

(current_node, state) => next_node
```

You will specify what to do after reaching a node and where to go next.

<h2 align="center">Contributing</h2>

- Documentation deeply describes the internal API for each package.

This project is in an early stage.

We are looking for:

1. Proposals about new features
2. Faster algorithms
3. Defining best practices

<h2 align="center">Core Team</h2>

<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <img width="150" height="150" src="https://github.com/stavalfi.png?s=150">
        <br>
        <a href="https://github.com/stavalfi">Stav Alfi</a>
        <p>Core</p>
        <br>
        <p>Founder</p>
      </td>
     </tr>
  </tbody>
</table>
