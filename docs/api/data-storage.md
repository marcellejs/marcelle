---
sidebarDepth: 3
---

# Data Storage

Marcelle provides a flexible interface for creating _data stores_ that provide a unified interface for storing data either on the client side (in memory or using web storage) or on a remote server.
Some components rely on the definition of a data store &ndash; for instance, the [Dataset](/api/data-storage.html#dataset) component that needs to store instances, &ndash; however data collections can be created on the fly to store custom information when relevant. This is particularly useful to store some of the state of the application (for instance the model's parameters), a history of changes to the application, or custom session logs recording some of the user's interactions.

We use the [Feathers](https://feathersjs.com/) framework to facilitate the creation of collections of heterogeneous data. When data is stored on the client side, no configuration is necessary. For remote data persistence, a server application can be generated in minutes using Feather’s command-line interface, with a large range of database systems available. The flexible selection of the data store's location is advantageous for rapid prototyping, where data is stored on the client side or using a local server during development.

## DataStore

The following factory function creates and returns a Marcelle data store:

```tsx
dataStore(location: string): DataStore
```

The `location` argument can either be:

- `'memory'` (default): in this case the data is stored in memory, and does not persist after page refresh
- `'localStorage'`: in this case the data is stored using the browser's web storage. It will persist after page refresh, but there is a limitation on the quantity of data that can be stored.
- a URL indicating the location of the server. The server needs to be programmed with Feathers, as described [below](#generating-a-server-application).

### .connect()

```tsx
async connect(): Promise<User>
```

Connect to the data store backend. If using a remote backend, the server must be running, otherwise an exception will be thrown. If the backend is configured with user authentication, this method will require the user to log in.

This method is automatically called by dependent components such as datasets and models.

### .login()

```tsx
async login(email: string, password: string): Promise<User>;
```

### .logout()

```tsx
async logout(): Promise<void>
```

### .service()

```tsx
service(name: string): Service<unknown>
```

Get the Feathers service instance with the given `name`. If the service does not exist yet, it will be automatically created. Note that the name of the service determines the name of the collection in the data store. It is important to choose name to avoid potential conflicts between collections.

The method returnsa Feathers Service instance, which API is documented on [Feathers' wesite](https://feathersjs.com/api/services.html). The interface exposes `find`, `get`, `create`, `update`, `patch` and `remove` methods for manipulating the data.

### .uploadAsset()

```tsx
async uploadAsset(blob: Blob, filename = ''): Promise<string>
```

Upload an asset to a remote backend from a Blob, with an optional filename. The method returns the path of the file on the backend server.

### .signup()

```tsx
async signup(email: string, password: string): Promise<User>
```

## Service

Data Services are instances of Feathers Services. For details, refer to [Feather's documentation](https://feathersjs.com/api/services.html). From Feathers:

> Service methods are pre-defined [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) methods that your service object can implement (or that have already been implemented by one of the [database adapters](https://feathersjs.com/api/databases/adapters)). Below is an example of a Feathers service using [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) as a [JavaScript class](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes):

```js
class MyService {
  async find(params) {
    return [];
  }
  async get(id, params) {}
  async create(data, params) {}
  async update(id, data, params) {}
  async patch(id, data, params) {}
  async remove(id, params) {}
  setup(app, path) {}
}

app.use('/my-service', new MyService());
```

Service methods must use [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) or return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and have the following parameters:

- `id` — The identifier for the resource. A resource is the data identified by a unique id.
- `data` — The resource data.
- `params` - Additional parameters for the method call (see [Feathers Docs](https://feathersjs.com/api/services.html#params))

### .find()

```tsx
Service<T>.find(params: Params): Promise<Paginated<T>>
```

Retrieves a list of all resources from the service. `params.query` can be used to filter and limit the returned data.

### .get(id, params)

```tsx
Service<T>.get(id: string, params: Params): Promise<T>
```

Retrieves a single resource with the given `id` from the service.

### .create()

```tsx
Service<T>.create(data: T, params: Params): Promise<T>
```

Creates a new resource with `data`. The method should return with the newly created data. `data` may also be an array.

### .update()

```tsx
Service<T>.update(id: string, data: T, params: Params): Promise<T>
```

Replaces the resource identified by `id` with `data`. The method should return with the complete, updated resource data. `id` can also be `null` when updating multiple records, with `params.query` containing the query criteria.

### .patch()

```tsx
Service<T>.patch(id: string, data: Partial<T>, params: Params): Promise<T>
```

Merges the existing data of the resource identified by `id` with the new `data`. `id` can also be `null` indicating that multiple resources should be patched with `params.query` containing the query criteria.

### .remove()

```tsx
Service<T>.remove(id: string, params: Params): Promise<T>
```

Removes the resource with `id`. The method should return with the removed data. `id` can also be `null`, which indicates the deletion of multiple resources, with `params.query` containing the query criteria.

## ServiceIterable

A `ServiceIterable` is a lazy iterable data collection over a data store service. This allows to execute processing of the data of a service in a lazy manner, on demand. A Service Iterable can be created using the following factory function:

```tsx
function iterableFromService<T>(service: Service<T>): ServiceIterable<T>;
```

This function returns an iterable, that has the following API:

```ts
export class ServiceIterable<T> extends LazyIterable<T> {
  skip(n: number): ServiceIterable<T>;
  take(n: number): ServiceIterable<T>;
  select(fields: string[]): ServiceIterable<T>;
  query(q: Params['query']): ServiceIterable<T>;
}
```

The LazyIterable class is documented in [utilities](/api/utilities.html#lazyiterable). There are a few additional methods specific to data store services that are meant to improve performance. These methods relate to querying the datastore (which is backed by Feathers.js). They can be chained like other LazyIterable methods, but they **must be used before other LazyIterable methods**.

**Example:**

```ts
// We want to get service items that have the field 'team' equal to 'A'. We skip 3 items
// and keep the next 5, and select a few fields to be returned.
const myIterable = iterableFromService(store.service('things))
  .query({ team: 'A' })
  .skip(3)
  .take(5)
  .select(['_id', 'x', 'y', 'label']);
  // The iterable is created, but the processing won't be executed until we iterate on it:
for await (const x of myIterable) {
  console.log(x)
}
  // Or if we convert it to an array:
const myThings = await myIterable.toArray();
```

### .skip()

```tsx
skip(n: number): ServiceIterable<T>;
```

Skip n elements from the service

### .take()

```tsx
take(n: number): ServiceIterable<T>;
```

Take only n elements from the service

### .select()

```tsx
select(fields: string[]): ServiceIterable<T>;
```

Select the fields to be returned for each item in the service. This can be used to optimize bandwidth and speed, by limiting the query to only the necessary fields.

### .query()

```tsx
query(q: Params['query']): ServiceIterable<T>;
```

Query items from the service using Feather.js's query syntax. See [Feathers docs](https://feathersjs.com/api/databases/querying.html)

## Dataset

```tsx
dataset<T extends Instance>(name: string, store?: DataStore): Dataset<T>
```

A Dataset component allowing for capturing instances from a stream, storing them in a local or remote [data-store](/api/data-storage.html#datastore). Items of the datasets are called instances, and are JavaScript objects with arbitrary shape, although by convention the fields `x`, `y` and `thumbnail` are commonly used. When using TypeScript, it is possible to extend the specification of the `Instance` interface:

```ts
export interface Instance {
  id?: ObjectId; // Object identifier in the database
  x: any; // Typically, input data
  y: any; // Typically, output data (for supervised learning)
  thumbnail?: string; // Thumbnail used for display in components such as datasetBrowser
  [key: string]: any;
}
```

**Example:**

```js
const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet', store);

$instances.subscribe(trainingSet.create);
```

### Parameters

| Option | Type      | Description                                                                                   | Required |
| ------ | --------- | --------------------------------------------------------------------------------------------- | :------: |
| name   | string    | The dataset name                                                                              |    ✓     |
| store  | DataStore | The [dataStore](/api/data-storage.html#datastore) used to store the instances of the dataset. |    ✓     |

### Properties

| Name      | Type                      | Description                                                                                                                                                                                              | Hold |
| --------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$count   | Stream\<number\>          | Total number of instances in the dataset                                                                                                                                                                 |      |
| \$changes | Stream\<DatasetChange[]\> | Stream of changes applied to the dataset. Changes can concern a number of modifications (creation, update, deletion, ...) at various levels (dataset, class, instance). The interface is described below |      |

Where dataset changes have the following interface:

```ts
interface DatasetChange {
  level: 'instance' | 'dataset';
  type: 'created' | 'updated' | 'removed' | 'renamed';
  data?: unknown;
}
```

### .clear()

```tsx
async clear(): Promise<void>
```

Clear the dataset, removing all instances.

### .create()

```tsx
async create(instance: Instance<InputType, OutputType>, params?: FeathersParams): Promise<Instance<InputType, OutputType>>
```

Create an instance in the dataset

| Option   | Type                              | Description                                                                                         | Required |
| -------- | --------------------------------- | --------------------------------------------------------------------------------------------------- | :------: |
| instance | Instance\<InputType, OutputType\> | The instance data                                                                                   |    ✓     |
| params   | FeathersParams                    | Feathers Query parameters. See [Feathers docs](https://feathersjs.com/api/databases/querying.html). |          |

### .download()

```tsx
async download(): Promise<void>
```

Download the dataset as a unique json file.

### .find()

```tsx
async find(params?: FeathersParams): Promise<Paginated<Instance<InputType, OutputType>>>
```

Get instances from the dataset, optionally passing Feathers parameters. Results are paginated, using the same format as services.

| Option | Type           | Description                                                                                         | Required |
| ------ | -------------- | --------------------------------------------------------------------------------------------------- | :------: |
| params | FeathersParams | Feathers Query parameters. See [Feathers docs](https://feathersjs.com/api/databases/querying.html). |          |

### .get()

```tsx
async get(id: ObjectId, params?: FeathersParams): Promise<Instance<InputType, OutputType>>
```

Get an instance from the dataset by ID, optionally passing Feathers parameters.

| Option | Type           | Description                                                                                         | Required |
| ------ | -------------- | --------------------------------------------------------------------------------------------------- | :------: |
| id     | ObjectId       | The instance's unique ID                                                                            |    ✓     |
| params | FeathersParams | Feathers Query parameters. See [Feathers docs](https://feathersjs.com/api/databases/querying.html). |          |

### .items()

```tsx
items(): ServiceIterable<Instance<InputType, OutputType>>
```

Get a lazy [service iterable](#serviceiterable) to iterate over the dataset.

Example:

```ts
const instances = await dataset
  .items() // get iterable
  .query({ label: 'A' }) // query instances with label 'A'
  .select(['id', 'thumbnail']) // select the fields to return
  .toArray(); // convert to array
```

### .patch()

```tsx
patch(id: ObjectId, changes: Partial<Instance>, params?: FeathersParams): Promise<Instance>
```

Patch an instance in the dataset

| Option  | Type                | Description                                                                                         | Required |
| ------- | ------------------- | --------------------------------------------------------------------------------------------------- | :------: |
| id      | ObjectId            | The instance's unique ID                                                                            |    ✓     |
| changes | Partial\<Instance\> | The instance data                                                                                   |    ✓     |
| params  | FeathersParams      | Feathers Query parameters. See [Feathers docs](https://feathersjs.com/api/databases/querying.html). |          |

### .remove()

```tsx
remove(id: ObjectId, params?: FeathersParams): Promise<Instance>
```

Remove an instance from the dataset

| Option | Type           | Description                                                                                         | Required |
| ------ | -------------- | --------------------------------------------------------------------------------------------------- | :------: |
| id     | ObjectId       | The instance's unique ID                                                                            |    ✓     |
| params | FeathersParams | Feathers Query parameters. See [Feathers docs](https://feathersjs.com/api/databases/querying.html). |          |

### .sift()

```tsx
sift(query: Query = {}): void
```

Filter the contents of the dataset from a [Feathers Query](https://feathersjs.com/api/databases/querying.html). Sifting a dataset enforces that instances respect a given query. This affects all interactions with the dataset and dependent components. Note that it is possible to create several instances of datasets with different sift filters, that point to the same data store service (effectively creating different views on a given data collection).

| Option | Type  | Description                                                                                         | Required |
| ------ | ----- | --------------------------------------------------------------------------------------------------- | :------: |
| query  | Query | Feathers Query parameters. See [Feathers docs](https://feathersjs.com/api/databases/querying.html). |          |

### .update()

```tsx
update(id: ObjectId, instance: Instance<InputType, OutputType>, params?: FeathersParams): Promise<Instance>
```

Update an instance in the dataset

| Option   | Type                              | Description                                                                                         | Required |
| -------- | --------------------------------- | --------------------------------------------------------------------------------------------------- | :------: |
| id       | ObjectId                          | The instance's unique ID                                                                            |    ✓     |
| instance | Instance\<InputType, OutputType\> | The instance data                                                                                   |    ✓     |
| params   | FeathersParams                    | Feathers Query parameters. See [Feathers docs](https://feathersjs.com/api/databases/querying.html). |          |

### .upload()

```tsx
async upload(files: File[]): Promise<void>
```

Upload a dataset from files.

| Option | Type   | Description                 | Required |
| ------ | ------ | --------------------------- | :------: |
| files  | File[] | Array of files of type File |    ✓     |

## Server-Side Storage

Marcelle provides a dedicated package for server-side data storage: [`@marcellejs/backend`](https://www.npmjs.com/package/@marcellejs/backend). It can easily be integrated into existing Marcelle applications using the CLI, and only require minimal configuration for local use.

Marcelle backends are [FeathersJS](https://docs.feathersjs.com/) applications, that provide persistent data storage with either NeDb or MongoDb.

::: warning Disclaimer
The backend package is under active development and is not yet stable. It is not production-ready.
:::

### Adding a backend to an existing application

A backend can be added to a Marcelle application using the [CLI](/cli.html):

<CodeGroup>
<CodeGroupItem title="npm">

```bash
npx marcelle
```

</CodeGroupItem>

<CodeGroupItem title="yarn">

```bash
yarn marcelle
```

</CodeGroupItem>

<CodeGroupItem title="pnpm">

```bash
pnpx marcelle
```

</CodeGroupItem>
</CodeGroup>

Select 'Manage the backend', then 'Configure a backend'. this will install `@marcellejs/backend` as a dependency to your project and create configuration files.

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

### Configuration

Backends can be configured through two JSON files located in the `backend/config` directory, for development of production. Please refer to [Feather's documentation](https://feathersjs.com/api/configuration.html) for general information about Feathers configuration. In this section, we detail Marcelle-specific configuration only.

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

### Permissions

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
