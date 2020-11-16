# CLI

Marcelle provides a command line interface for generating applications.

<!-- [![npm version](https://img.shields.io/npm/v/@marcellejs/cli)](https://www.npmjs.com/package/@marcellejs/cli) -->
<!-- [https://github.com/marcellejs/cli](https://github.com/marcellejs/cli) -->

## Installation

```bash
npm install -g @marcellejs/cli
```

## Usage

```
$ mkdir myproject

$ cd myproject

$ marcelle help

  Usage: marcelle generate [type]


  Options:

    -V, --version  output the version number
    -h, --help     output usage information


  Commands:

    generate|g [type]  Run a generator. Type can be
    	• app - Create a new Marcelle application in the current folder
    	• module - Generate a new module for an existing application
    	• backend - Add a server-side backend for your application's data

    *

$ marcelle generate app

$ npm run dev
```
