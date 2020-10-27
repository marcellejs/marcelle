# Marcelle - Inference Model

This example shows how to load a pre-trained deep neural network in Marcelle and use it for inference. 

## Convert an existing model

In this version, only Keras models can be converted to a compatible tfjs model. 

### Python requirements 

- Python 3
- `tensorflow`
- `tensorflowjs`

Tested with Python 3.7.3, `tensorflow==2.3.1`, `tensorflowjs==2.4.0`

#### Convert a model

Run:

```sh
python keras2tfjs_model_converter.py
```

By default, the script import a `Resnet` modelk but you can change this model and use any models proposed here: [https://keras.io/api/applications](https://keras.io/api/applications). Also the tjfs model is saved locally in a `tjfsmodel` folder. 



### Running the example

> Reminder: you need to build the library at least once with `yarn build`

From the root directory run:

```sh
yarn serve:examples
```

Open: [http://localhost:5000/examples/inference/](http://localhost:5000/examples/inference/)
