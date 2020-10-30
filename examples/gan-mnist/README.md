# Marcelle - GAN Example with MNIST

TODO: description

## Running the Example

### Requirements (Python Training Server)

- Python 3
- `numpy`
- `matplotlib`
- `tensorflow` >= 2
- `tensorflowjs`
- `websockets`

Tested with Python 3.8.6, `tensorflow==2.3.0`, `tensorflowjs==2.4.0` and `websockets==8.1`

### Running the training server

From this directory (`examples/gan-mnist`), run:

```sh
python server.py
```

### Running the Example HTTP server

> Reminder: you need to build the library at least once with `yarn build`

From the root directory run:

```sh
yarn serve:examples
```

Open: [http://localhost:5000/examples/gan-mnist/](http://localhost:5000/examples/gan-mnist/)
