<h2 align="center">Marcelle.js</h2>

<p align="center">A reactive framework for building interactive machine learning applications</p>
<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

## About

Marcelle is an experimental framework for building interactive machine learning applications.

<p style="color: crimson;">TODO: Description</p>

> Marcelle was designed as supporting material for the "Interactive Machine Learning" elective class of the Interaction specialty of Université Paris-Sud Master's degree.

<p style="color: crimson;">TODO: Update docs</p>

[Full Documentation](https://marcelle.netlify.com)

## Installation

<p style="color: crimson;">TODO: Publish on NPM</p>

[See online documentation](https://marcelle.netlify.com/installation.html)

Using NPM:

```bash
npm install marcellejs --save
```

Using Yarn:

```bash
yarn add marcellejs
```

## Usage

[See the online documentation](https://marcelle.netlify.com/installation.html) for more examples:

```js
// TODO: EXAMPLE
```

## 🔨 Built Using

- [TypeScript](https://www.typescriptlang.org/)
- [Tensorflow.js](https://js.tensorflow.org/)
- [Most](https://github.com/mostjs/core)
- [Svelte](https://svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
<!-- - [Apexcharts](Apexcharts) -->

## 🛠 Developing

### Setting up VSCode

[Download VSCode](https://code.visualstudio.com/) and install the following extensions:

- [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### Building the library

To build for production:

```bash
yarn build # OR npm run build
```

To build for development (watch mode):

```bash
yarn dev # OR npm run dev
```

To generate the typescript declaration files (useful for the rollup example), run `yarn build:types` in production, or `yarn dev:types` in development.

### Building the Rollup example

The best is to use a symlink to the local library to install the rollup example. From the root:

```bash
yarn link
cd examples/rollup
yarn link marcellejs
```

## ✍️ Authors

- [@JulesFrancoise](https://github.com/JulesFrancoise/)
- [@bcaramiaux](https://github.com/bcaramiaux/)

## 🎉 Acknowledgements

- [Teachable Machine](https://teachablemachine.withgoogle.com/)
- [Wekinator](http://www.wekinator.org/)

<p style="color: crimson;">TODO: Update references</p>
