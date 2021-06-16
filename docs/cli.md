---
sidebarDepth: 2
---

# CLI

Marcelle provides a command line interface, for generating applications, components and backends. The source code is available on [Github](https://github.com/marcellejs/cli).

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

![Screenshot of the CLI's options](./images/cli_app.png)

This will scaffold a new Marcelle project with the following structure (it might vary according to the build tool, this example is for vite):

```bash
.
├── README.md
├── index.html     # The main HTML page for your application
├── package.json
├── src
│   ├── index.js   # Main application script
│   └── components    # Directory containing local components bundled with your application
│       └── index.js
└── vite.config.js # Build tool configuration file
```

To run the application in development mode (with HMR), run:

```bash
npm run dev # or yarn dev
```

### Generating a Component

It is possible to use the generator to create new custom components for an application or a marcelle package.

```bash
marcelle generate component
```

Just enter your component's name (e.g. `my-component`) and the generator will create a template component that you can your in your script:

```js
import { myComponent } from './components';

const m = myComponent(opts);
```

Components are stored in the `src/components` directory and provide a [Svelte](https://svelte.dev) view by default:

```bash
.
├── src
│   └── components
│       ├── my-component
│       │   ├── my-component.component.js # Component definition file
│       │   ├── my-component.view.svelte    # Svelte component defining the component's view
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
