# Introduction

**Marcelle** is an interactive Machine Learning (ML) toolkit that has been designed to allow ML practitioners, with various levels of expertise, to explore ML and build applications embedding ML models.
Marcelle is a web-based reactive toolkit facilitating the design of custom ML pipelines and personalized user interfaces enabling user interactions on the pipeline's constitutive elements.

Marcelle aims to address the following use cases:

1. Interactively designing ML-based web applications with small datasets
2. Teaching ML to an audience without specific skills in ML or CS
3. Learning about ML concepts through exploratory interactive training and testing
4. Discovering and exploring expressive (big) ML models.

Can't wait? [→ Go to the Getting Started Guide](/guide/getting-started.html)

## Example

The following screenshot shows a simple example of application with an interactive dashboard dedicated to training an image recognizer using training examples captured from the webcam. The application, along with the source code, is available online on [Glitch](https://glitch.com/~marcelle-v2-dashboard).

![Screenshot of an example marcelle Application](./images/marcelle_dashboard_01.png)

## Architecture

<!-- TODO: Move to API? -->

Marcelle presents itself as a collection of reactive components embedding the state and logic for particular tasks. Components are the building blocks of a Marcelle application and handle various tasks such as capturing images from a webcam, defining a new dataset, instancing a Deep Neural Network (DNN), displaying a confusion matrix, or monitoring the confidence of a model prediction, to name a few.

Because Marcelle emphasizes instant feedback and user interaction, components often provide a graphical user interface that can be displayed on demand in a web application. This component-based architecture provides both modularity and granularity.
On the one hand, each component enables granular interaction onto one specific element from the ML pipeline (for instance visualizing and adjusting the parameters of a DNN).
On the other hand, the modularity of the toolkit allows ML practitioners for customizing interfaces used to train, test or edit a model or a dataset. Marcelle provides two mechanisms to build user interfaces with components: dashboards and wizards. Dashboards are applications containing multiple pages where developers can display the views of various components. Wizards can be programmed to guide end-users or novices through a series of steps.

While components have heterogeneous purposes, their unified interface makes it easy for developers to link together various parts of the processing. Marcelle relies on a reactive programming paradigm to facilitate the definition of such custom pipelines linking together the various tasks of a machine learning workflow. Each component exposes a set of data streams containing the various events produced by the component. These data streams can easily be manipulated (filtered, transformed, combined) and plugged into other components to define pipelines.

Finally, Marcelle's API allows a practitioner to both create ML pipelines and their associated user interfaces. The versatility and accessibility of this API has been one of the most important challenge in the design of Marcelle.
