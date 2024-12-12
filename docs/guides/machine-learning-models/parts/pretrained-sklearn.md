## Using Scikit-Learn Models

There are two possible solutions to use a Scikit-Learn model in a Marcelle application.

### Solution 1: server-side inference with Ray <span :class="$style.tip">Recommended for most cases</span>

In most cases, the simplest solution consists in using a Python web framework of serving library to expose the model at a HTTP endpoint. Several possibilities exist, including generic web frameworks such as [Starlette](https://www.starlette.io/).

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

### Solution 2: client-side inference with ONNX <span :class="$style.tip">Recommended for small models</span>

In some cases, it can be useful to run the inference on the client side, to avoid, for instance, sending private client data to the server. It also simplifies the deployment of the application, as it is not necessary to run and maintain a web server that performs inference in real-time, and a static website might be enough.

For these scenarios, your Scikit-Learn model can be converted to the [ONNX format](https://onnx.ai/) (Open Neural Network Exchange), so that inference is performed in the web browser using [onnxruntime](https://onnxruntime.ai/).

Pros:

- Privacy: no user data needs to be sent to the server for inference
- Low latency: once the model is loaded, predictions do not depend on the internet connection, which is useful for high-throuput applications
- Easy deployment: no need to manage an inference server

Cons:

- Limited compatibility: ONNX Runtime-web remains experimental and not all operators are supported, which can
- Dependence on the user's device can limit performance
- Not appropriate for "big" models, both regarding network and performance issues

<VPButton
  tag="a"
  size="medium"
  theme="brand"
  text="See the guide"
  href="/guides/machine-learning-models/"
/>
