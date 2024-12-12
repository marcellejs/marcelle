## Using Tensorflow or Keras Models

There are 3 possible solutions to use a Tensorflow model in a Marcelle application.

::: warning TODO

Write docs

:::

### Solution 1: client-side inference with Tensorflow.js

In some cases, it can be useful to run the inference on the client side, to avoid, for instance, sending private client data to the server. It also simplifies the deployment of the application, as it is not necessary to run and maintain a web server that performs inference in real-time, and a static website might be enough.

For these scenarios, your Tensorflow model can be converted to a web-friendly format ro run inference in the web browser using the [Tensorflow.js](https://www.tensorflow.org/js/) library.

Pros:

- TODO

Cons:

- TODO

<VPButton
  tag="a"
  size="medium"
  theme="brand"
  text="See the guide"
  href="/guides/machine-learning-models/"
/>

### Solution 2: server-side inference with Ray

Another solution consists in using a Python web framework of serving library to expose the model at a HTTP endpoint. Several possibilities exist, including Tensorflow-specific libraries such as [TFX's TensorFlow Serving](https://www.tensorflow.org/tfx/guide/serving) or generic web frameworks such as [Starlette](https://www.starlette.io/).

We recommend using [Ray Serve](https://docs.ray.io/en/latest/serve/index.html), a framework-agnostic model serving library for building online inference APIs. Ray enables you to expose your prediction function over an HTTP endpoint, which can be interogated from a lightweight custom Marcelle component and seamlessly integrated in a Marcelle App.

Pros:

- High compatibility: it is possible to run any Python code, with any ML framework
- Scalability: Ray facilitate scaling and using various architectures
- Independent from the client's capabilities

Cons:

- Requires setting up and managing a HTTP server
- Requires sending client data to the server

<VPButton
  tag="a"
  size="medium"
  theme="brand"
  text="See the guide"
  href="/guides/machine-learning-models/server-side-inference.html#serving-a-python-model-with-ray"
/>

### Solution 4: server-side inference through the backend <span :class="$style.tip">Recommended&nbsp;for&nbsp;long&nbsp;inference</span>

This solution is recommended when inference is long (e.g. in generative tasks) and requires real-time monitoring. In that case, it is possible to use a data service on the Marcelle backend to manage and monitor inference runs. Predictions are requested by the web client, and the status of the processing can be updated from Python to enable realtime monitoring in the web client, thanks to websocket communication.

Pros:

- Realtime monitoring: during inference, the Python code can update the status
- Python scripts are websocket clients, meaning that the machine running the Python code does not need to run a server and expose an endpoint publicly.

Cons:

- Complex for simple use cases
- Experimental: stability is not ensured

<VPButton
  tag="a"
  size="medium"
  theme="brand"
  text="See the guide"
  href="/guides/machine-learning-models/"
/>
