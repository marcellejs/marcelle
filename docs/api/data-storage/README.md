---
sidebarDepth: 3
---

# Overview

::: warning TODO
Improve Introduction
:::

Marcelle provides a flexible interface for creating _data stores_ that provide a unified interface for storing data either on the client side (in memory or using web storage) or on a remote server.
Some components rely on the definition of a data store &ndash; for instance, the [Dataset](/api/components/data.html#dataset) module that needs to store instances, &ndash; however data collections can be created on the fly to store custom information when relevant. This is particularly useful to store some of the state of the application (for instance the model's parameters), a history of changes to the application, or custom session logs recording some of the user's interactions.

We use the [Feathers](https://feathersjs.com/) framework to facilitate the creation of collections of heterogeneous data. When data is stored on the client side, no configuration is necessary. For remote data persistence, a server application can be generated in minutes using Feather’s command-line interface, with a large range of database systems available. The flexible selection of the data store's location is advantageous for rapid prototyping, where data is stored on the client side or using a local server during development.
