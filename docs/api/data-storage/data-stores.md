---
sidebarDepth: 3
---

# Data Stores

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

This method is automatically called by dependent modules such as datasets and models.

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

The method returnsa Feathers Service instance, which API is documented on [Feathers' wesite](https://docs.feathersjs.com/api/services.html#service-methods). The interface exposes `find`, `get`, `create`, `update`, `patch` and `remove` methods for manipulating the data.

### .signup()

```tsx
async signup(email: string, password: string): Promise<User>
```

## Services

### TODO: Feathers Service CRUD API

### TODO: iterableFromService
