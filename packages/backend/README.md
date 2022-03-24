# marcelle-backend

A simplified backend system for Marcelle applications.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

## About

This is a wrapper around [Feathers](http://feathersjs.com) that provides a simplified interface for the creation of Marcelle data backends.

It currently supports NeDB and MongoDB databases.

## Getting Started

The easiest way to get started is to use Marcelle's CLI:
https://github.com/marcellejs/cli

1. Install `@marcellejs/cli`:

   ```
   npm i -g yo @marcellejs/cli
   ```

2. Generate an application, choosing `On the server` to the question 'Where do you want to store the data?'

   ```
   marcelle generate app
   ```

## Configuration

The backend can be configured using the file `backend/config/default.json`.

The main options are:

- `database`: `nedb` or `mongodb`. For MongoDB, you will have to run mongod locally.
- `authentication.enabled`: specifies if the backend should use authentication

## ✍️ Authors

- [@JulesFrancoise](https://github.com/JulesFrancoise/)
- [@bcaramiaux](https://github.com/bcaramiaux/)

## 🔨 Built Using

- [Feathers](https://feathersjs.com/)
