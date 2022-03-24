# Marcelle CLI

[![npm version](https://img.shields.io/npm/v/@marcellejs/cli)](https://www.npmjs.com/package/@marcellejs/cli)
![Status](https://img.shields.io/badge/status-active-success.svg)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

A command line interface for Marcelle applications

## Installation

The CLI is an npm package that must be installed globally:

```bash
npm install -g @marcellejs/cli
```

Once installed, the `marcelle` command should be available:

```bash
marcelle --version
```

## Usage

### Generating an Application

To generate a new project:

```bash
mkdir myproject
cd myproject
marcelle generate app
```

Several options are available to customize the project. If you don't know what to chose, just hit enter to select the defaults.

This will scaffold a new Marcelle project with the following structure (it might vary according to the build tool, this example is for vite):

```bash
.
├── README.md
├── index.html     # The main HTML page for your application
├── package.json
├── src
│   ├── index.js   # Main application script
│   └── modules    # Directory containing local modules bundled with your application
│       └── index.js
└── vite.config.js # Build tool configuration file
```

To run the application in development mode (with HMR), run:

```bash
npm run dev # or yarn dev
```

### Generating a Module

It is possible to use the generator to create new custom modules for an application or a marcelle package.

```bash
marcelle generate module
```

Just enter your module's name (e.g. `my-module`) and the generator will create a template module that you can your in your script:

```js
import { myModule } from "./modules";

const m = myModule(opts);
```

Modules are stored in the `src/modules` directory and provide a [Svelte](https://svelte.dev) view by default:

```bash
.
├── src
│   └── modules
│       ├── my-module
│       │   ├── my-module.module.js # Module definition file
│       │   ├── my-module.svelte    # Svelte component defining the module's view
│       │   └── index.js            # function wrapper
│       └── index.js
```

### Generating a Backend

It is possible to use the generator to add server-side data storage (backend).

```bash
marcelle generate backend
```

Two options are available for the backend:

- The type of database: [NeDB](https://github.com/louischatriot/nedb) and [MongoDB](https://www.mongodb.com/) are currently supported.
- Whether or not it should use authentication.

To run the server:

```bash
npm run backend
```

The backend configuration files are stored in `backend/configuration`.

## About

Marcelle CLI's generators are provided by [generator-marcelle](https://github.com/marcellejs/generator-marcelle).

## ✍️ Authors

- [@JulesFrancoise](https://github.com/JulesFrancoise/)
- [@bcaramiaux](https://github.com/bcaramiaux/)

## 🎉 Acknowledgements

- [Feathers CLI](https://github.com/feathersjs/cli)
- [Yeoman](https://yeoman.io/)
