# marcelle-backend

A simplified backend system for Marcelle applications.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

## About

This is a wrapper around [Feathers](http://feathersjs.com) that provides a simplified interface for the creation of Marcelle data backends.

It currently supports NeDB and MongoDB databases.

## Getting Started

[Online Documentation](https://marcelle.dev/api/data-storage.html#server-side-storage)

The easiest way to get started is to use Marcelle's [CLI](https://marcelle.dev/cli.html). In an existing Marcelle application, run the cli with `npx marcelle`. Select 'Manage the backend', then 'Configure a backend'. this will install `@marcellejs/backend` as a dependency to your project and create configuration files.

Two database systems are currently available for storing data:

- [NeDb](https://github.com/louischatriot/nedb) - an embedded datastore with a MongoDB like API. NeDB can store data in-memory or on the filesystem which makes it useful as a persistent storage without a separate database server.
- [MongoDb](https://www.mongodb.com/)

The CLI will install `@marcellejs/backend` and store configuration files in `backend/config`.

To run the backend locally:

```sh
npm run backend
```

The backend API will be available on [http://localhost:3030](http://localhost:3030). From a Marcelle application, interacting with this backend can be done through data stores, by instanciating them with the server URL as `location` parameter:

```js
const store = dataStore('http://localhost:3030');
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
