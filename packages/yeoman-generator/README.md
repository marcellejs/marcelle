# generator-marcelle

[![npm version](https://img.shields.io/npm/v/generator-marcelle)](https://www.npmjs.com/package/generator-marcelle)
![Status](https://img.shields.io/badge/status-active-success.svg)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

> A Yeoman generator for Marcelle applications

## Installation

First, install [Yeoman](http://yeoman.io) and generator-marcelle using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-marcelle
```

## Generating a Marcelle Application

To generate a new project:

```bash
yo marcelle
```

Several options are available to customize the project. If you don't know what to chose, just hit enter to select the defaults.

## Generating a Component

It is possible to use the generator to create new custom components for an application or a marcelle package.

```bash
yo marcelle:component
```

Just enter your component's name (e.g. my-component) and the generator will create a template component that you can your in your script:

```js
import { myComponent } from './components';

const m = myComponent(opts);
```

## Generating a Backend

It is possible to use the generator to add server-side data storage (backend).

```bash
yo marcelle:backend
```

To run the server:

```bash
npm run backend
```

## ✍️ Authors

- [@JulesFrancoise](https://github.com/JulesFrancoise/)
- [@bcaramiaux](https://github.com/bcaramiaux/)
