# Installation

There are several ways to start using Marcelle:

- If you just want to check out simple examples and edit them, use [Glitch](https://glitch.com/@marcelle.crew/marcelle-examples)
- If you want to generate an application template, use [Marcelle CLI](#using-marcelle-cli)
- Other wise, you can either use the marcelle package through [direct download or CDN ](#direct-download-cdn), or using [a package manager](#using-a-package-manager)

::: warning ⚠️ Experimental
Marcelle is still experimental and is currently under active development. Breaking changes are expected.
:::

## Direct Download / CDN

[https://unpkg.com/@marcellejs/core@next](https://unpkg.com/@marcellejs/core@next)

The above link will always point to the latest release on NPM.

marcelle relies on a number of packages that are not included in the build.
The following codes HTML template includes all the necessary dependencies to run a marcelle application.

<<< @/examples/dashboard/index.html

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

See the [CLI's documentation](/cli)
