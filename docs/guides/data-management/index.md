# Data Management Overview

Marcelle's client API relies on **data stores** that provide a unified interface for storing and synchronizing data either on the client side (in memory or using web storage) or on a remote server. Some components rely on the definition of a data store – for instance, the [Dataset](/api/data-storage.html#dataset) component that needs to store instances, – but data collections can be created on the fly to store custom information when relevant. This is particularly useful to store some of the state of the application (for instance the model's parameters), a history of changes to the application, or custom session logs recording some of the user's interactions.

We use the [Feathers](https://feathersjs.com/) framework to facilitate the creation of collections of heterogeneous data. When data is stored on the client side, no configuration is necessary. For remote data persistence, a server application can be generated in minutes using Feather’s command-line interface, with a large range of database systems available. The flexible selection of the data store's location is advantageous for rapid prototyping, where data is stored on the client side or using a local server during development.

::: warning TODO
Add Schema explaining the architecture
:::

## Interacting with Data Stores

::: warning TODO
TODO: simple tutorial showing how to create a datastore, create and interact with a service.
:::

```js
import { dataStore } from '@marcellejs/core';

// Data is stored in the user's web browser's LocalStorage:
const storeLocal = dataStore('localStorage');

// Data is temporarily stored in memory:
const storeMemory = dataStore('memory');

// Data is stored on a secure server (see below):
const storeRemote = dataStore('https://my-marcelle-backend.com');
await storeRemote.connect();
```

TODO:

```js
const things = store.service('things');
things.create({
  name: 'First item',
  otherValue: 3,
});

things.find().then(console.log);
```
