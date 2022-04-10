# Installation

There are several ways to start using Marcelle:

- If you just want to check out simple examples and edit them, use [Glitch](https://glitch.com/@marcelle.crew/marcelle-examples)
- If you want to generate an application template, use [Marcelle CLI](#using-marcelle-cli)
- Otherwise, you can either use the marcelle package through [direct download or CDN ](#direct-download-cdn), or using [a package manager](#using-a-package-manager)

::: warning ⚠️ Experimental
Marcelle is still experimental and is currently under active development. Breaking changes are expected.
:::

## Using create-marcelle

To create a new Marcelle project, just run:

<code-group>
<code-block title="npm">
```bash
npm init marcelle marcelle-tutorial
cd marcelle-tutorial
npm install
```
</code-block>

<code-block title="yarn">
```bash
yarn create marcelle marcelle-tutorial
cd marcelle-tutorial
yarn
```
</code-block>

<code-block title="pnpm">
```bash
pnpm create marcelle marcelle-tutorial
cd marcelle-tutorial
pnpm i
```
</code-block>
</code-group>

See the [CLI's documentation](/cli.html) for more information about available options.

## Using a package manager

Using npm:

```bash
npm install @marcellejs/core --save
```

or yarn:

```bash
yarn add @marcellejs/core
```

## Direct Download / CDN

```html
<script src="https://unpkg.com/@marcellejs/core"></script>
```

The following HTML and JS snippets provide a template marcelle application.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Marcelle Example</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="stylesheet" href="https://unpkg.com/@marcellejs/core@0.3.2/dist/marcelle.css" />
    <script defer type="module" src="script.js"></script>
  </head>
  <body>
    <noscript>
      <strong>
        We're sorry but this application doesn't work properly without JavaScript enabled. Please
        enable it to continue.
      </strong>
    </noscript>
  </body>
</html>
```

```js
import {
  dashboard,
  webcam,
} from 'https://unpkg.com/@marcellejs/core@0.3.2/dist/marcelle.bundle.esm.js';

const w = webcam();

const dash = dashboard({
  title: 'Hello Marcelle',
  author: 'Jane Doe',
});

dash.page('Main').sidebar(w);

dash.show();
```
