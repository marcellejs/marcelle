# App Generation

To create a new Marcelle project, just run:

::: code-group

```bash [npm]
npm init marcelle marcelle-tutorial
cd marcelle-tutorial
npm install
```

```bash [yarn]
yarn create marcelle marcelle-tutorial
cd marcelle-tutorial
yarn
```

```bash [pnpm]
pnpm create marcelle marcelle-tutorial
cd marcelle-tutorial
pnpm i
```

:::

Several options are available:

- Templates:
  - **Empty Marcelle App (default)**: a minimalistic Vite application, perfect for prototyping dashboards
  - **SvelteKit+Marcelle App**: a more elaborate template for multipage applications with a custom interface. It uses [SvelteKit](https://kit.svelte.dev/).
- TypeScript: use [Typescript](https://www.typescriptlang.org/) for your Marcelle application (including for custom components)

![Screenshot of the CLI's options](/images/cli_app.png)

::: warning Development version

While we work on the development version, the following steps need to be taken to generate a new application:

**0. Install pnpm**

```bash
npm i -g pnpm
```

**1. Build a local version of Marcelle Libraries**

Checkout the develop branch, install dependencies, and build all libraries:

```bash
git clone git@github.com:marcellejs/marcelle.git
cd marcelle
git checkout develop
pnpm i
pnpm build
```

**2. Generate the application**

We can then generate an application, and create symbolic links to libraries compiled locally. In this example, we generate an app `my-app` in the parent folder to the marcelle repo.

```bash
cd ../ # or another path
node ./marcelle/packages/create-marcelle/bin.js my-app
# When prompted, select the SvelteKit+Marcelle App template
cd my-app
```

Then, open the project in a code editor and remove the following lines from `package.json`:

```json {16}
{
  ...
  "dependencies": {
    "@marcellejs/core": "^0.6.5",
    "@marcellejs/gui-widgets": "^0.6.5", // [!code --]
    "@marcellejs/layouts": "^0.6.5", // [!code --]
    "rxjs": "^7.8.1"
  },
  ...
}
```

Finally, we can install dependencies, and link locally:

```bash
pnpm i
pnpm link ../marcelle/packages/core; pnpm link ../marcelle/packages/gui-widgets; pnpm link ../marcelle/packages/layouts; pnpm link ../marcelle/packages/devtools; pnpm link ../marcelle/packages/tensorflow
```

:::

## Dashboard template

::: warning TODO

template description

:::

## Sveltekit template

This template provides more flexibility on the application layout. Rather than imposing a rigid dashboard interface, it generates a default application with the [SvelteKit](https://svelte.dev/docs/kit/introduction) Framework. This allows to manually create various routes (or pages), with complete control over the page's markup and styling, while still facilitating the integration of Marcelle components and pipelines. Because Marcelle is a client-side library, the sveltekit application runs as a [Single-Page Application (SPA)](https://svelte.dev/docs/kit/project-types#Single-page-app). To facilitate styling, the template ships with the [TailwindCSS](https://tailwindcss.com/) framework and the [daisyUI](https://daisyui.com/) component library.

The typical project strucure is as follows:

```
my-project/
├ src/
│ ├ lib/
│ │ ├ marcelle/
│ │ │ └ [your marcelle component and pipeline definitions]
│ │ └ [your lib files]
│ ├ routes/
│ │ └ [your routes]
│ ├ app.html
│ ├ app.css
├ static/
│ └ [your static assets]
├ package.json
├ svelte.config.js
├ tsconfig.json
└ vite.config.js
```

The root directory contains a number of configuration files for SvelteKit (`svelte.config.js`, `vite.config.js`), for code linting and formatting (`eslint.config.js`, `prettier.config.mjs`). The core of the project is located in the `src`.
