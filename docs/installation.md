# Installation

There are several ways to start using Marcelle:

- If you just want to check out simple examples and edit them, use [Glitch](https://glitch.com/@marcelle.crew/marcelle-examples)
- If you want to generate an application template, use [Marcelle CLI](#using-marcelle-cli)
- Otherwise, you can either use the marcelle package through [direct download or CDN ](#direct-download-cdn), or using [a package manager](#using-a-package-manager)

::: warning ⚠️ Experimental
Marcelle is still experimental and is currently under active development. Breaking changes are expected.
:::

## Direct Download / CDN

```html
<script src="https://unpkg.com/@marcellejs/core@next"></script>
```

marcelle relies on a number of packages that are not included in the build.
The following codes HTML template includes all the necessary dependencies to run a marcelle application.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Marcelle Example</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="stylesheet" href="../../dist/bundle.css" />
    <script src="https://unpkg.com/@tensorflow/tfjs@2.7.0/dist/tf.min.js"></script>
    <script src="https://unpkg.com/@most/prelude@1.8.0/dist/index.js"></script>
    <script src="https://unpkg.com/@most/disposable@1.3.0/dist/index.js"></script>
    <script src="https://unpkg.com/@most/scheduler@1.3.0/dist/index.js"></script>
    <script src="https://unpkg.com/@most/core@1.6.1/dist/index.js"></script>
    <script src="https://unpkg.com/chart.js@3.0.0-beta.6/dist/chart.min.js"></script>
    <script src="https://unpkg.com/@marcellejs/core@next"></script>
    <script defer src="script.js"></script>
  </head>
  <body>
    <noscript>
      <strong>
        We're sorry but this application doesn't work properly without JavaScript enabled. Please
        enable it to continue.
      </strong>
    </noscript>
    <div id="app"></div>
  </body>
</html>
```

## Using a package manager

Using npm:

```bash
npm install @marcellejs/core@next --save
```

or yarn:

```bash
yarn add @marcellejs/core@next
```

## Using Marcelle CLI

Install the CLI globally:

```bash
npm install -g @marcellejs/cli
```

Generate a Marcelle application (if unsure about the options, just select the defaults):

```bash
marcelle generate app
```

See the [CLI's documentation](/cli.html)
