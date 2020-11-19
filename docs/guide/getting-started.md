# Getting started

In this tutorial, you will learn how to build a simple Marcelle application that allows the user to capture and annotate images from a webcam, train a classifier, assess it on the dataset, and play with real-time recognition. It is a toy example in Interactive Machine Learning, implemented in [Teachable Machine](https://teachablemachine.withgoogle.com/).

## Setting up

The easiest way to set up your application is by using the dedicated [Marcelle CLI tools](https://github.com/marcellejs/cli)). First install the Marcelle CLI tools:

```bash
$ npm install -g @marcellejs/cli
```

Then, create a folder for the app and run the CLI command:

```bash
$ mkdir marcelle-tutorial
$ cd marcelle-tutorial
$ marcelle generate app
```

## App basics

Marcelle is a client-side JavaScript framework. All Marcelle applications run in the browser without the need for communication with a Web server. In its simplest form, a Marcelle application is a webpage defined by `index.html` and a script file `src/index.ts` (or `src/index.js` if you chose JavaScript as language when generating your app).

To see the application running, type the command:

```bash
$ npm run dev
```

Your app should be running at `http://localhost:8080/`. If everything went well you should have a blank page. Let's now inspect what's your app is made of. Select the file `src/script.ts` (or `src/script.js`), that contains the most minimal skeleton of a marcelle application. In the file you should see some `import` commands and that's it. The application is therefore empty but all the modules are imported. We can now start to design our app.

## Data input

In our app, we want to capture images in order to interactively build a classifier. Images will be captured from the webcam. In Marcelle, a [webcam module](../api/modules.html#webcam) can easily be used by declaring it in the script:

```js
const input = webcam();
```

Note that if you look at the app in your browser (at `http://localhost:8080/`), you will still see a blank page. In fact, Marcelle allows you to build you ML pipelines and choose which elements to display on an interface.

## Showing the interface

Two types of interfaces are currently available: [Dashboards](../api/interfaces.html#dashboards) or Wizard [Wizards](../api/interfaces.html#wizards). In this tutorial we will create a dashboard where we will add elements from the pipeline that we would like to display. To create a dashboard, the API provides a `.dashboard()` function:

```js
const myDashboard = dashboard({
  title: 'My First Tutorial',
  author: 'Marcelle Crew',
});
```

Then to visualise the created dashobaord, we need to `start` it:

```js
myDashboard.start();
```

Now, you should see an empty dashboard in the browser.

![Screenshot of an empty marcelle dashboard](./images/empty-dashboard.png)

To display a module on the dashboard, we first to create a page (see the [dashboard API](../api/interfaces.html#dashboards) for more details) and specificy all the modules disaplyed on this dashboard page with the `.useLeft()` and `.use()` functions. `.useLeft()` adds modules on the left column of the dashboard while the `.use()` function adds modules on the main central column. In this tutorial we will add the webcam on the left of a dashboard page called "Data Management". Above the `dashboard.start();` statement:

```js
myDashboard.page('Data Management').useLeft(input);
```

Which should look like this:

![Screenshot of an empty marcelle dashboard](./images/dashboard-with-camera.png)

## Building the ML pipeline

### Feature extraction and dataset creation

If we want to build a classifier that takes images as inputs and that can be trained efficiently with few samples, we usually don't use the raw image data. We need to extract features that are well suited for the task. To do so, we could use a pre-trained model called `Mobilenet` that takes an image as input (whose size is 224 x 224 x 3 so 150528 dimensions) and outputs a vector of lower dimension. To declare a mobilenet feature extractor in Marcelle, we do:

```js
const featureExtractor = mobilenet();
```

And if we want to compute the features associated to each new images from the webcam input, we subscribe to the `images` stream and process the data:

```js
input.$images.subscribe(async (img) => await featureExtractor.process(img));
```

In Marcelle, an instance of a dataset also comprised other fields. We can create a derived stream of instances from the webcam stream like this:

```js
const instances = input.$images
  .map(async (img) => ({
    type: 'image',
    data: img,
    label: myLabel,
    thumbnail: input.$thumbnails.value,
    features: await featureExtractor.process(img),
  }))
  .awaitPromises();
```

In this example, we see that the label is also specified by a string that we denoted as `myLabel`. In an application, a label can be provided by the user through a [textfield](../api/modules/widgets.html#textfield) on the interface:

```js
const label = marcelle.textfield();
label.name = 'Instance label';
```

The textfield module has a `$text` stream that we can used when created the stream of instances:

```js{5}
const instances = input.$images
  .map(async (img) => ({
    type: 'image',
    data: img,
    label: label.$text.value,
    thumbnail: input.$thumbnails.value,
    features: await featureExtractor.process(img),
  }))
  .awaitPromises();
```

We now create a dataset that can be used to train a classifier. A dataset requires a [DataStore](../api/data-stores.html#datastore) to store the captured data. A datastore can be created in the `localStorage` of your browser, but also on a server using a specified database.

Once the datastore has been instanciated, we declare a marcelle [dataset](../api/modules/data.html#dataset) with a given name and a given datastore. The dataset has a `capture` method to store an incoming stream of instances. In Marcelle, these three steps can be done as such:

```js
const ds = marcelle.dataStore({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', ds });
trainingSet.capture(instances);
```

At this point, if you run this application on the browser, you will still only see the webcam input on the interface (as we didn't add anything else on the `dashboard`), but more annoying, you will add every frame of the webcam as new instance in the dataset... To avoid this, we can create a [button](../api/modules/widgets.html#button) to start and stop the capture.

```js
const capture = marcelle.button({ text: 'Hold to record instances' });
capture.name = 'Capture instances to the training set';
```

And then we conditioned the stream of instances to status of this button:

```js
const instances = input.$images
  .filter(() => capture.$down.value))
  .map(async (img) => ({
    type: 'image',
    data: img,
    label: label.$text.value,
    thumbnail: input.$thumbnails.value,
    features: await featureExtractor.process(img),
  }))
  .awaitPromises();
```

Finally, we plot on the interface the label textfield, the capture button and a dataset [browser](../api/modules/data.html#browser) that provides an interface to visualize the dataset content.

```js
const trainingSetBrowser = marcelle.browser(trainingSet);
```

```js{2}
myDashboard.page('Data Management').useLeft(input).use(label, capture, trainingSetBrowser);
```

If you refresh the page in the browser, you should have the following:

![Screenshot](./images/getting-started-trainingset-browser.png)

### Training a classifier

Next, we have to declare a classifier to be trained on the training dataset. In this tutorial we use a Multilayer Perceptron (MLP), that can be declared by:

```js
const classifier = mlp({ layers: [32, 32], epochs: 20 });
```

To start training, a button is added on the interface:

```js{6}
const trainingButton = marcelle.button({ text: 'Train' });
...
myDashboard
  .page('Data Management')
  .useLeft(input)
  .use(label, capture, trainingSetBrowser, trainingButton);
```

Then we attached the training method of the MLP classifier to the stream of clicks. As such, each time an event is triggered through a click, the classifier will be trained on the `trainingSet`:

```js
trainingButton.$click.subscribe(() => {
  classifier.train(trainingSet);
});
```

When training Deep Neural Networks, it is usually important to monitor the training, which typically means to inspect the losses and the accuracies. In Marcelle, the trainingPlot module can be used to do so and then added to the dashboard.

```js{9}
const plotTraining = trainingPlot(classifier);

...

myDashboard
  .page('Data Management')
  .useLeft(input)
  .use(label, capture, trainingSetBrowser, trainingButton)
  .uses(plotTraining);
```

Thus, after addingin instances to the dataset (instances assoicated to more than one class), launching training is visualised as follows:

![Screenshot](./images/getting-started-training.png)
