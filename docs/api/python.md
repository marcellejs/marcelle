---
sidebarDepth: 3
---

# Python API

A minimalistic Python package is provided on Pypi.org to facilitate access to Marcelle backend servers from Python scripts. The package essentially implements an interface to interact with FeatherJs services over either websocket or HTTP.

::: warning TODO
More details + Update API docs (WS+HTTP)
:::

## DataStore

```python
class DataStore()
```

### \_\_init\_\_

```python
 | __init__(location="http://localhost:3030")
```

DataStores enable communication with Marcelle Backends. DataStores provide
access to services registered on a backend at the specified location.

**Arguments**:

- `location` _str, optional_ - Backend URL. Defaults to "http://localhost:3030".

### .service()

```python
 | service(name)
```

Access a service by name

**Arguments**:

- `name` _str_ - service name

**Returns**:

- `Service` - Marcelle Service object.

## Service

```python
class Service()
```

### \_\_init\_\_

```python
 | __init__(location)
```

Services provide an interface to interact with data stored in Marcelle backend.
Since Marcelle backends are based on Feathers.js (https://feathersjs.com/),
services provide a similar API with predefined CRUD methods.

**Arguments**:

- `location` _str_ - Service location URL.

### .find()

```python
 | find(params={})
```

Retrieves a list of all resources from the service. params.query can be used
to filter and limit the returned data.

**Arguments**:

- `params` _dict, optional_ - contain additional information for the service
  method call. See https://feathersjs.com/api/services.html#params
  Defaults to {}.

**Returns**:

- `dict` - A dictionary containing the response. Data is paginated by default.
  see https://feathersjs.com/api/services.html#params

### .get()

```python
 | get(id, params={})
```

Retrieves a single resource with the given id from the service.

**Arguments**:

- `id` _str_ - unique identifier of the ressource
- `params` _dict, optional_ - contain additional information for the service
  method call. See https://feathersjs.com/api/services.html#params
  Defaults to {}.

**Returns**:

- `dict` - the requested item as a dictionary

### .create()

```python
 | create(data, params={})
```

Creates a new resource with data. The method should return with the newly
created data. data may also be an array.

**Arguments**:

- `data` _dict_ - ressource data as a JSON-serializable dictionary
- `params` _dict, optional_ - contain additional information for the service
  method call. See https://feathersjs.com/api/services.html#params
  Defaults to {}.

**Returns**:

- `dict` - the created ressource

### .update()

```python
 | update(id, data, params={})
```

Replaces the resource identified by id with data. The method should
return with the complete, updated resource data. id can also be null
when updating multiple records, with params.query containing the query
criteria.

**Arguments**:

- `id` _str_ - unique identifier of the ressource
- `data` _dict_ - ressource data as a JSON-serializable dictionary
- `params` _dict, optional_ - contain additional information for the service
  method call. See https://feathersjs.com/api/services.html#params
  Defaults to {}.

**Returns**:

- `dict` - updated resource data

### .patch()

```python
 | patch(id, data, params={})
```

Merges the existing data of the resource identified by id with the new
data. id can also be null indicating that multiple resources should be
patched with params.query containing the query criteria.

**Arguments**:

- `id` _str_ - unique identifier of the ressource
- `data` _dict_ - partial ressource data as a JSON-serializable dictionary
- `params` _dict, optional_ - contain additional information for the service
  method call. See https://feathersjs.com/api/services.html#params
  Defaults to {}.

**Returns**:

- `dict` - updated resource data

### .remove()

```python
 | remove(id, params={})
```

Removes the resource with id. The method should return with the removed
data. id can also be null, which indicates the deletion of multiple
resources, with params.query containing the query criteria.

**Arguments**:

- `id` _str_ - unique identifier of the ressource
- `params` _dict, optional_ - contain additional information for the service
  method call. See https://feathersjs.com/api/services.html#params
  Defaults to {}.

**Returns**:

- `dict` - the removed data

### .items()

```python
 | items(query={})
```

Returns an iterator over the service data, given an optional query.
See feathers documentation for querying:
https://feathersjs.com/api/databases/querying.html

**Arguments**:

- `query` _dict, optional_ - Optional query.
  See https://feathersjs.com/api/databases/querying.html.
  Defaults to {}.

**Yields**:

- `dict` - service ressource

## utils

### conform_dict

```python
conform_dict(d)
```

Normalize a dictionary for JSON serialization, casting numpy types

**Arguments**:

- `d` _dict_ - Input dictionary

**Returns**:

- `dict` - Normalized dictionary
