# What is marcelle?

Marcelle is a versatile interactive machine learning toolkit that has been designed to allow ML practitioners, with various levels of expertise, to explore ML and build applications embedding ML models. In particular, Marcelle aims to address the following use cases:

1. interactively designing ML-based web applications with small datasets
2. teaching ML to an audience without specific skills in ML or CS
3. learning about ML concepts through exploratory interactive training and testing
4. discovering and exploring expressive (big) ML models.

Marcelle is a web-based reactive toolkit facilitating the design of custom ML pipelines and personalized user interfaces enabling user interactions on the pipeline's constitutive elements.

## Architecture

Marcelle presents itself as a collection of reactive modules embedding the state and logic for particular tasks. Modules are the building blocks of a Marcelle application and handle various tasks such as capturing images from a webcam, defining a new dataset, instancing a Deep Neural Network (DNN), displaying a confusion matrix, or monitoring the confidence of a model prediction, to name a few.

Because Marcelle emphasizes instant feedback and user interaction, modules often provide a graphical user interface that can be displayed on demand in a web application. This module-based architecture provides both modularity and granularity.
On the one hand, each module enables granular interaction onto one specific element from the ML pipeline (for instance visualizing and adjusting the parameters of a DNN).
On the other hand, the modularity of the toolkit allows ML practitioners for customizing interfaces used to train, test or edit a model or a dataset. Marcelle provides two mechanisms to build user interfaces with modules: dashboards and wizards. Dashboards are applications containing multiple pages where developers can display the views of various modules. Wizards can be programmed to guide end-users or novices through a series of steps.

While modules have heterogeneous purposes, their unified interface makes it easy for developers to link together various parts of the processing. Marcelle relies on a reactive programming paradigm to facilitate the definition of such custom pipelines linking together the various tasks of a machine learning workflow. Each module exposes a set of data streams containing the various events produced by the module. These data streams can easily be manipulated (filtered, transformed, combined) and plugged into other modules to define pipelines.

Finally, Marcelle's API allows a practitioner to both create ML pipelines and their associated user interfaces. The versatility and accessibility of this API has been one of the most important challenge in the design of Marcelle.

## basic Example

The following script is a simple example of application definition, that will produce
the application presented in the next figure. You can run this example online [here](https://glitch.com/~marcelle-v2-dashboard).

<<< @/examples/dashboard/script.js

![Screenshot of an example marcelle Application](./marcelle_dashboard_01.png)
