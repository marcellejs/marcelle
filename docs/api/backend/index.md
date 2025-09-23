---
sidebarDepth: 3
---

# @marcellejs/backend

This package contains Marcelle's server-side framework that is used for data storage and real-time synchronization.

This the [guide](/guides/data-management/server-side-data-storage) for setting up the backend in an existing Marcelle application.

## Configuration

Backends can be configured through two JSON files located in the `backend/config` directory, for development of production. Please refer to [Feather's documentation](https://feathersjs.com/api/configuration.html) for general information about Feathers configuration. In this section, we detail Marcelle-specific configuration only.

::: warning TODO
Update Configuration DOcs
:::

| name                   | type             | default                                      | description                                                                                                                                  |
| ---------------------- | ---------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| host                   | string           | localhost                                    | Host Name for development.                                                                                                                   |
| port                   | number           | 3030                                         | Port                                                                                                                                         |
| database               | nedb \| mongodb  | nedb                                         | The type of database to use. This is pre-configured when generated with the CLI.                                                             |
| nedb                   | path             | "../data"                                    | The local path to the folder where NeDb data should be stored                                                                                |
| uploads                | path             | "../uploads"                                 | The local path to the folder where file uploads should be stored                                                                             |
| mongodb                | url              | "mongodb://localhost:27017/marcelle_backend" | The URL of the MongoDB database used for development                                                                                         |
| gridfs                 | boolean          | true                                         | Whether or not to upload files and assets to GridFS instead of the file system                                                               |
| whitelist.services     | string[] \| "\*" | "\*"                                         | The list of services that are allowed on the backend. "\*" acts as a wildcard, allowing any service to be created from Marcelle applications |
| whitelist.assets       | string[] \| "\*" | ["jpg", "jpeg", "png", "wav"]                | The types of assets (file extensions) allowed for file upload on the server                                                                  |
| paginate.default       | number           | 100                                          | The default number of items per page for all requests                                                                                        |
| paginate.max           | number           | 1000                                         | The maximum number of items per page for all requests                                                                                        |
| authentication.enabled | boolean          | false                                        | Whether or not to enable authentication                                                                                                      |

## Permissions

It is possible to specify the permissions for a particular project in the configuration file. The `permissions` field of the config file accepts a record associating the role name ("editor" by default) to an array of [CASL](https://casl.js.org/v6/en/) Rules.

The following example specifies a default set of permissions:

```json
  "permissions": {
    "superadmin": [
      {"action": "manage", "subject": "all"}
    ],
    "admin": [
      { "action": "manage", "subject": "all", "conditions": { "userId": "${user._id}" } },
      { "action": "manage", "subject": "all", "conditions": { "public": "${true}" } },
      { "action": "manage", "subject": "users" }
    ],
    "editor": [
      { "action": "manage", "subject": "all", "conditions": { "userId": "${user._id}" } },
      { "action": "manage", "subject": "all", "conditions": { "public": "${true}" } },
      { "action": "read", "subject": "users" },
      { "action": "update", "subject": "users", "conditions": { "_id": "${user._id}" } },
      { "action": "delete", "subject": "users", "conditions": { "_id": "${user._id}" }, "inverted": "true" }
    ]
  }
```
