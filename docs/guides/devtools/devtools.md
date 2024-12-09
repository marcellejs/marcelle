# Development Tools (CLI)

When generating a new Marcelle application, a CLI is installed as a development dependency (`@marcellejs/devtools`). It includes a number of useful tools for development.

To run the CLI from your project's root:

::: code-group

```bash [npm]
npx marcelle
```

```bash [yarn]
yarn marcelle
```

```bash [pnpm]
pnpx marcelle
```

:::

### Generating a Component

It is possible to use the CLI to create new custom components for an application or a marcelle package. Run `npx marcelle`, then select 'Create a component' and enter your component's name (e.g. `my-component`). Several templates are available for new components:

- Skeleton component with a Svelte UI [default]
- Simple Classifier (Tensorflow.js)
- Custom Model (Tensorflow.js)

The generator will create a template component that you can use your in your script:

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

### Managing the Backend

The CLI offers two tools to manage persistent data in a server-side 'backend'.

#### Configuring a backend

To simply add a backend to your application, select 'Manage the backend', then 'Configure a backend'. this will install `@marcellejs/backend` as a dependency to your project and create configuration files.

Two options are available for the backend:

- The name of the MongoDB database to use
- Whether or not the server should use authentication.

After reinstalling dependencies (`npm install` or `yarn` or `pnpm install`), you can run the server:

```bash
npm run backend
```

The backend configuration files are stored in `backend/configuration`.

#### Exporting a backend (experimental)

It is possible to export the source code for the backend in the './backend' directory in order to customize it.
