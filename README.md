<h2 align="center">Marcelle.js</h2>

<p align="center">A reactive framework for building interactive machine learning applications</p>
<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

## About

Marcelle is an interactive machine learning toolkit that has been designed to allow ML practitioners, with various levels of expertise, to explore ML and build applications embedding ML models. In particular, Marcelle aims to address the following use cases:

1. interactively designing ML-based web applications with small datasets
2. teaching ML to an audience without specific skills in ML or CS
3. learning about ML concepts through exploratory interactive training and testing
4. discovering and exploring expressive (big) ML models.

Marcelle is a web-based reactive toolkit facilitating the design of custom ML pipelines and personalized user interfaces enabling user interactions on the pipeline's constitutive elements.

[Online Documentation](https://marcelle.netlify.com)

## Installation

[See online documentation](https://marcelle.netlify.com/installation.html)

Using NPM:

```bash
npm install @marcellejs/core@next --save
```

Using Yarn:

```bash
yarn add @marcellejs/core@next
```

## Usage

See [Online Documentation](https://marcelle.netlify.com) and [Examples](https://glitch.com/@marcelle.crew/marcelle-examples).

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
yarn link @marcellejs/core
```

## ✍️ Authors

- [@JulesFrancoise](https://github.com/JulesFrancoise/)
- [@bcaramiaux](https://github.com/bcaramiaux/)

## 🔨 Built Using

- [TypeScript](https://www.typescriptlang.org/)
- [Most](https://github.com/mostjs/core)
- [Svelte](https://svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tensorflow.js](https://js.tensorflow.org/)
- [Chartjs](https://www.chartjs.org/)
- And more...

## 🎉 Acknowledgements

- [Teachable Machine](https://teachablemachine.withgoogle.com/)
- [Wekinator](http://www.wekinator.org/)
