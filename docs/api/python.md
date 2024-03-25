---
sidebarDepth: 3
---

# Python API

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
Since Marcelle backends are based on Feathers.js (https://crow.docs.feathersjs.com/),
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
  method call. See httpscrow.://docs.feathersjs.com/api/services.html#params
  Defaults to {}.

**Returns**:

- `dict` - A dictionary containing the response. Data is paginated by default.
  see httpscrow.://docs.feathersjs.com/api/services.html#params

### .get()

```python
 | get(id, params={})
```

Retrieves a single resource with the given id from the service.

**Arguments**:

- `id` _str_ - unique identifier of the ressource
- `params` _dict, optional_ - contain additional information for the service
  method call. See httpscrow.://docs.feathersjs.com/api/services.html#params
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
  method call. See httpscrow.://docs.feathersjs.com/api/services.html#params
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
  method call. See httpscrow.://docs.feathersjs.com/api/services.html#params
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
  method call. See httpscrow.://docs.feathersjs.com/api/services.html#params
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
  method call. See httpscrow.://docs.feathersjs.com/api/services.html#params
  Defaults to {}.

**Returns**:

- `dict` - the removed data

### .items()

```python
 | items(query={})
```

Returns an iterator over the service data, given an optional query.
See feathers documentation for querying:
httpscrow.://docs.feathersjs.com/api/databases/querying.html

**Arguments**:

- `query` _dict, optional_ - Optional query.
  See httpscrow.://docs.feathersjs.com/api/databases/querying.html.
  Defaults to {}.

**Yields**:

- `dict` - service ressource

## Remote

```python
class Remote()
```

### \_\_init\_\_

```python
 | __init__(backend_root="http://localhost:3030", save_format="tfjs", source="keras")
```

The remote manager for Marcelle allows to save run information and upload
model checkpoints and assets to a Marcelle backend

**Arguments**:

- `backend_root` _str, optional_ - The backend's root URL.
  Defaults to "http://localhost:3030".
- `save_format` _str, optional_ - Format used to upload the models to the
  backend. Can be either "tfjs" or "onnx". Defaults to "tfjs".
- `source` _str, optional_ - Source framework name. Only "keras" is
  currently fully supported. Defaults to "keras".

### .create()

```python
 | create(run_data)
```

Create a new training run, and upload it on the server

**Arguments**:

- `run_data` _dict, optional_ - Run data as a JSON-serializable dictionary.

- `TODO` - Document "run_data" format (@see Writer)

### .update()

```python
 | update(run_data=None)
```

Update the run data, and upload it on the server

**Arguments**:

- `run_data` _dict, optional_ - Run data as a JSON-serializable dictionary.

### .upload_model()

```python
 | upload_model(path_to_model, local_format, metadata={})
```

Upload a model checkpoint to the backend server

**Arguments**:

- `path_to_model` _string_ - local path to the model files
- `local_format` _string_ - format of the saved model. Can be "h5 or
  "save_model".
- `metadata` _dict, optional_ - Optional metadata to save with the model.
  Defaults to {}.

**Raises**:

- `Exception` - When local and remote formats are Unsupported

**Returns**:

- `dict` - The stored model's information from the backend

### .upload_tfjs_model()

```python
 | upload_tfjs_model(tmp_path, metadata={})
```

Upload a TFJS model checkpoint to the backend server

**Arguments**:

- `tmp_path` _string_ - local path to the temporary model files
- `metadata` _dict, optional_ - Optional metadata to save with the model.
  Defaults to {}.

**Returns**:

- `dict` - The stored model's information from the backend

### .upload_onnx_model()

```python
 | upload_onnx_model(tmp_path, metadata={})
```

Upload an ONNX model checkpoint to the backend server

**Arguments**:

- `tmp_path` _string_ - local path to the temporary model files
- `metadata` _dict, optional_ - Optional metadata to save with the model.
  Defaults to {}.

**Returns**:

- `dict` - The stored model's information from the backend

### .upload_asset()

```python
 | upload_asset(path_to_asset, metadata={})
```

Upload an asset to the backend server. Assets are files of arbitrary
format (images, sound files, ...)

**Arguments**:

- `path_to_asset` _string_ - local path to the asset file
- `metadata` _dict, optional_ - Optional metadata to save with the asset.
  Defaults to {}.

**Returns**:

- `dict` - The stored assets's information from the backend

### .retrieve_run()

```python
 | retrieve_run(run_start_at)
```

Retrieve a training run from the backend using its starting date

**Arguments**:

- `run_start_at` _string_ - Starting date of the run

**Returns**:

- `dict` - The run data if it was found on the server, False otherwise

### .remove_run()

```python
 | remove_run(run_data)
```

Remove a given run from the server, along with the associated
checkpoints and assets.

**Arguments**:

- `run_data` _dict_ - Run data to be removed.
  Must have "\_id" and "checkpoints" fields

**Returns**:

- `bool` - wether the run was successfully removed

## Uploader

```python
class Uploader()
```

### \_\_init\_\_

```python
 | __init__(remote)
```

The Uploader class alows to upload the results of a locally
stored training run to the backend.

**Arguments**:

- `remote` _Remote_ - An instance of Remote class

- `TODO` - Implement asset uploading

### .upload()

```python
 | upload(run_directory, overwrite=False)
```

Upload a training run from a directory

**Arguments**:

- `run_directory` _string_ - run directory, from a Writer or Keras callback
- `overwrite` _bool, optional_ - If True, overwrites the data on the server,
  replacing run information and checkpoints. Defaults to False.

**Raises**:

- `Exception` - If the input directory does not exist

## KerasCallback

```python
class KerasCallback(tf.keras.callbacks.Callback)
```

### \_\_init\_\_

```python
 | __init__(name, backend_root="http://localhost:3030", disk_save_format="h5", remote_save_format="tfjs", model_checkpoint_freq=None, base_log_dir="marcelle-logs", run_params={})
```

A Keras Callback to store training information in a Marcelle backend and locally.

**Arguments**:

- `name` _str_ - The base name for the run.
- `backend_root` _str, optional_ - The backend's root URL.
  Defaults to "http://localhost:3030".
- `disk_save_format` _str, optional_ - Format used to store the models locally.
  Can be either "saved_model" or "h5". Defaults to "h5".
- `remote_save_format` _str, optional_ - Format used to upload the models to the
  backend. Can be either "tfjs" or "onnx". Defaults to "tfjs".
- `model_checkpoint_freq` _number, optional_ - The frequency at which checkpoints
  should be saved (in epochs). Defaults to None.
- `base_log_dir` _str, optional_ - Path to the directory where runs should be
  stored. Defaults to "marcelle-logs".
- `run_params` _dict, optional_ - A dictionary of parameters associated with
  the training run (e.g. hyperparameters). Defaults to {}.

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

### get_model_info

```python
get_model_info(model, source, loss=None)
```

Get information about a Keras Model

**Arguments**:

- `model` - an instance of `keras.Model`
- `source` _string_ - The source framework (only `keras` is currently supported)
- `loss` _string or loss function, optional_ - Loss function used for training.
  Defaults to None.

**Raises**:

- `Exception` - When another source than `keras` is used

**Returns**:

- `dict` - Keras model information

## Writer

```python
class Writer()
```

### \_\_init\_\_

```python
 | __init__(name, backend_root="http://localhost:3030", disk_save_format="h5", remote_save_format="tfjs", base_log_dir="marcelle-logs", source="keras")
```

The Writer class allows to save training information locally and to a backend

**Arguments**:

- `name` _str_ - The base name for the run.
- `backend_root` _str, optional_ - The backend's root URL.
  Defaults to "http://localhost:3030".
- `disk_save_format` _str, optional_ - Format used to store the models locally.
  Can be either "saved_model" or "h5". Defaults to "h5".
- `remote_save_format` _str, optional_ - Format used to upload the models to the
  backend. Can be either "tfjs" or "onnx". Defaults to "tfjs".
- `base_log_dir` _str, optional_ - Path to the directory where runs should be
  stored. Defaults to "marcelle-logs".
- `source` _str, optional_ - Source framework name. Only "keras" is
  currently fully supported. Defaults to "keras".

- `TODO` - take a remote instance as argument (as for uploader), and make it optional
- `TODO` - make Keras model optional

### .create_run()

```python
 | create_run(model=None, run_params={}, loss=None)
```

Create a new training run

**Arguments**:

- `model` _keras.Model, optional_ - A keras.Model instance associated with the
  training run_params (dict, optional): A dictionary of parameters
  associated with the training run (e.g. hyperparameters). Defaults to {}.
- `loss` _string or loss function, optional_ - The loss function used for
  training. Defaults to None.

### .train_begin()

```python
 | train_begin(epochs)
```

Signal that the training has started

**Arguments**:

- `epochs` _number_ - The total number of expected training epochs

### .save_epoch()

```python
 | save_epoch(epoch, logs=None, save_checkpoint=False, assets=[])
```

Save the results at the end of an epoch, with optional associated
checkpoint and assets

**Arguments**:

- `epoch` _number_ - the epoch
- `logs` _dict, optional_ - A dictionary of log values to record for the
  current epochs. The information should only concern the current
  epoch (for instance, logs for loss values should be scalar:
- ``{"loss"` - 3.14}`). Defaults to None.
- `save_checkpoint` _bool, optional_ - If `True`, a checkpoint will be saved
  locally and uploaded to the backend, according to the formats specified
  in the constructor. Defaults to False.
- `assets` _list[string], optional_ - A list of assets paths associated with
  the epoch to upload. Defaults to [].

### .train_end()

```python
 | train_end(logs=None, save_checkpoint=False)
```

Signal that the training has ended

**Arguments**:

- `logs` _dict, optional_ - Dictionary of logs (UNUSED?). Defaults to None.
- `save_checkpoint` _bool, optional_ - If `True`, a checkpoint will be saved
  locally and uploaded to the backend, according to the formats specified
  in the constructor. Defaults to False.
