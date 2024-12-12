<script setup>
  import VPButton from '../../components/VPButton.vue'
</script>

# Introduction

Marcelle aims to facilitate the integration of, and interaction with, a broad spectrum of machine learning models. To that end, Marcelle provides a simple unified interface for ML models allowing to run inference or train the model from a given dataset, if possible. Today, machine learning practicioners rely on various frameworks such as Scikit-Learn, Tensorflow, PyTorch to develop and train their models. In order to provide support for diverse workflows, Marcelle provides several ways to integrate ML models, with inference running on either the client or server sides. Possible architectures are described below.

We provide a simple decision tree to help you choose the best way to use your own machine learning model in a Marcelle application:

<VPButton
  tag="a"
  size="medium"
  theme="brand"
  text="How to use my model?"
  href="/guides/machine-learning-models/model-decision-tree"
/>

## The Model Interface

Models are standard Marcelle components with two additional characteristics. First, they have a property called `parameters`, which is a record of parameter values as streams. This structure is useful to provide interfaces that dynamically change the values of the model parameters. Second, they carry a set of methods for training and inference. Some methods are standardized, such as `.train(dataset)` and `.predict(features)`, however models can expose additional specific methods. By convention, most ML models do not provide a graphical user interface, because a number of other components are dedicated to manipulating their parameters, monitoring their status, or visualizing their output.

The Model API is fully described [on this page](/api/models).

## Possible architectures

Schema here:

- training either client or server
- inference either client or server

See the slides for PNRIA?
