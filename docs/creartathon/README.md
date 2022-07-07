# Creartathon 2022 - Move2Music Tutorial

In this tutorial, you will learn how to build a simple Marcelle application that allows the user to train a classifier to recognize images from the webcam in order to interact with music.

## Setting up

Two Options:

- Go to [https://codesandbox.io/s/marcelle-template-qyf287](https://codesandbox.io/s/marcelle-template-qyf287) and just start editing!

OR

- Just go to [https://glitch.com/edit/#!/marcelle-v2-blank](https://glitch.com/edit/#!/marcelle-v2-blank)
  and click on "Remix to Edit" at the top right, then start editing the script.

## App basics

Marcelle is (mostly) a client-side JavaScript framework. All Marcelle applications run in the browser without the need for communication with a Web server. In its simplest form, a Marcelle application is a webpage defined by `index.html` and a script file `script.js`.

To see the application running, click on "preview > In a new window". You should have a dashboard with a single text component.

Let's now inspect what's your app is made of. Open the file `script.js`, that contains the most minimal skeleton of a marcelle application. Let's start from scratch!
Delete the contents of the file except for the first line, that imports the marcelle library:

```js
import * as marcelle from 'https://unpkg.com/@marcellejs/core@0.5.1/dist/marcelle.bundle.esm.js';
```

## Setting up a webcam

In our app, we want to capture images in order to interactively build a classifier. Marcelle is built around _components_, that can be instanciated using construction functions. To create a new [webcam component](../api/components/data-sources.html#webcam), add the following line to the script:

```js
const input = marcelle.webcam();
```

Note that if you look at the app in your browser, you will still see a blank page. In fact, Marcelle allows you to build you ML pipelines and choose which elements to display on an interface.

## Showing the interface

Two types of interface composition mechanisms (or layouts) are currently available: [Dashboards](../api/dashboard.html) or Wizard [Wizards](../api/wizard.html). In this tutorial we will create a dashboard where we will add elements from the pipeline that we would like to display. To create a dashboard, the API provides a `dashboard()` function:

```js
const myDashboard = marcelle.dashboard({
  title: 'My First Tutorial',
  author: 'Myself',
});
```

Then to visualise the created dashboard, we need to `start` it:

```js
myDashboard.show();
```

Now, you should see an empty dashboard in the browser.

![Screenshot of an empty marcelle dashboard](./empty-dashboard.png)

To display a component on the dashboard, we first create a page (see the [dashboard API](../api/dashboard.html) for more details) and specify all the components displayed on this dashboard page with the `.sidebar()` and `.use()` functions. `.sidebar()` adds components on the left column of the dashboard while the `.use()` function adds components on the main central column. In this tutorial we will add a webcam on the left of a dashboard page called "Data Management". Above the `dashboard.show();` statement:

```js{6}
const myDashboard = marcelle.dashboard({
  title: 'My First Tutorial',
  author: 'Myself',
});

myDashboard.page('Data Management').sidebar(input);

myDashboard.show();
```

Which should look like this:

![Screenshot of an empty marcelle dashboard](./dashboard-with-webcam.png)

## Building the ML pipeline

### Feature extraction and dataset creation

If we want to build a classifier that takes images as inputs and that can be trained efficiently with few samples, we usually don't use the raw image data. We need to extract features that are well suited for the task. To do so, we could use a pre-trained model called `Mobilenet` that takes an image as input (whose size is 224 x 224 x 3 so 150528 dimensions) and outputs a vector of lower dimension. To declare a mobilenet feature extractor in Marcelle, we do:

```js
const featureExtractor = marcelle.mobileNet();
```

Marcelle heavily relies on a paradigm called reactive programming. Reactive programming means programming with asynchronous data streams, i.e. sequences of ongoing events ordered in time. Most Marcelle components expose data streams that can be filtered, transformed, and consumed by other components.

For example, the `webcam` component exposes a stream called `$images`, that periodically emits events containing an image of the webcam content. To react to these events, we can subscribe to the stream, for instance to log its events to the console:

```js
input.$images.subscribe((img) => {
  console.log(img);
});
```

If you open your browser's developer tools, you should see messages printed with images sampled from the webcam in `ImageData` format.

And if we want to compute the features associated to each new image from the webcam input, we write a function that subscribes to the `images` stream and processes the data:

```js
input.$images.subscribe(async (img) => {
  const features = await featureExtractor.process(img);
  console.log(features);
});
```

We now create a derived stream of instances from the webcam stream like this:

```js
const $instances = input.$images
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    y: 'test',
    thumbnail: input.$thumbnails.value,
  }))
  .awaitPromises();
```

Instances have few properties. In this example, we see that the label is specified by a string that we 'hard-coded' to `test`. In an application, a label can be provided by the user through a [textInput](../api/components/widgets.html#textinput) on the interface:

```js
const label = marcelle.textInput();
label.title = 'Instance label';
```

Let's add the text field to the dashboard page using the dashboard's `.use()` method:

```js
myDashboard.page('Data Management').sidebar(input, featureExtractor).use(label);
```

The textInput component exposes a `$text` stream that emits values whenever the user input changes. Let's log it to the console:

```js
label.$value.subscribe((currentInput) => {
  console.log('currentInput:', currentInput);
});
```

We can access the current value of a stream using its `.value` property. We use it to complement our stream of instances:

```js{4}
const $instances = input.$images
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    y: label.$value.value,
    thumbnail: input.$thumbnails.value,
  }))
  .awaitPromises();
```

We now create a dataset that can be used to train a classifier. A dataset requires a [DataStore](../api/data-storage.html#datastore) to store the captured data. A datastore can be created in the `localStorage` of your browser, but also on a server using a specified database.

Once the datastore has been instanciated, we declare a marcelle [dataset](../api/data-storage.html#dataset) with a given name and a given datastore. The dataset has a `capture` method to store an incoming stream of instances. In Marcelle, these three steps can be done as such:

```js
const store = marcelle.dataStore('localStorage');
const trainingSet = marcelle.dataset('TrainingSet', store);

$instances.subscribe(trainingSet.create.bind(trainingSet));
```

To visualize our training dataset, we can use a component called [datasetBrowser](../api/components/data-displays.html#datasetbrowser) that provides an interface to visualize the dataset content.

```js
const trainingSetBrowser = marcelle.datasetBrowser(trainingSet);

// ...

myDashboard.page('Data Management').sidebar(input, featureExtractor).use(label, trainingSetBrowser);
```

If you draw on the webcam, you will notice that an instance is recorded at every stroke, because the dataset is capturing all instances coming from the webcam. To give the user more control over what is captured as training data, we can create a [button](../api/components/widgets.html#button) to capture particular images.

```js
const capture = marcelle.button('Click to record an instance');
capture.title = 'Hold to record images';

// ...

myDashboard
  .page('Data Management')
  .sidebar(input, featureExtractor)
  .use([label, capture], trainingSetBrowser);
```

Using reactive programming, we can filter, transform and combine streams. In this case, we want to sample instances whenever the button is clicked. To do this, we can use the `sample` method from the button's `$click` stream:

```js
const $instances = input.$images
  .filter(() => capture.$pressed.value)
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    y: label.$value.value,
    thumbnail: input.$thumbnails.value,
  }))
  .awaitPromises();
```

If you refresh the page in the browser, you should have:

![Screenshot](./getting-started-trainingset-browser.png)

### Training a classifier

Next, we have to declare a classifier that will learn to recognize drawings from the training dataset. In this tutorial we use a Multilayer Perceptron (MLP), that can be declared by:

```js
const classifier = marcelle.mlpClassifier({ layers: [32, 32], epochs: 20 });
```

To start training, a button is added on the interface:

```js{8}
const trainingButton = marcelle.button('Train');

// ...

myDashboard
  .page('Data Management')
  .sidebar(input, featureExtractor)
  .use([label, capture], trainingSetBrowser, trainingButton);
```

Then, we attach the training method of the MLP classifier to the stream of clicks. This way, each time an event is triggered through a click, the classifier will be trained on the `trainingSet`:

```js
trainingButton.$click.subscribe(() => {
  classifier.train(trainingSet);
});
```

When training Deep Neural Networks, it is usually important to monitor the training, which typically means to inspect the losses and the accuracies. In Marcelle, the `trainingPlot` component can be used to do so and then added to the dashboard.

```js{9}
const plotTraining = marcelle.trainingPlot(classifier);

// ...

myDashboard
  .page('Data Management')
  .sidebar(input, featureExtractor)
  .use([label, capture], trainingSetBrowser, trainingButton)
  .use(plotTraining);
```

Thus, after adding instances to the dataset, launching training is visualised as follows:

![Screenshot](../guide/images/getting-started-training.png)

## Making Predictions

Now that our model is trained, we can create another pipeline for prediction. With the same input webcam, we will make a prediction at every new drawing, using the trained model.

To create a stream of predictions, we need to pass images through the feature extractor (mobilenet), and then through the `.predict()` method of our classifier. To do this, we use the `.map()` method of streams, that transforms a stream by applying a function to each of its elements:

```js
const $predictions = input.$images
  .map(async (img) => {
    const features = await featureExtractor.process(img);
    return classifier.predict(features);
  })
  .awaitPromises();

$predictions.subscribe(console.log);
```

Note that in Marcelle, prediction functions are asynchronous. This means that they return promises. In order to create a stream containing the resulting values, we need to call `awaitPromises()` on the resulting stream.

To visualize the predictions, we can use a component called `classificationPlot`. Let's add the webcam and this visualization component to a new page so that we can test our classifier:

```js
const predViz = marcelle.confidencePlot($predictions);

myDashboard.page('Real-Time').sidebar(input).use(predViz);
```

To give it a try, first train the model, then switch to the second page for testing!

![Screenshot](../guide/images/getting-started-testing.png)

## Adding Sound

To finalize our body-based music instrument, we can integrate an audio processing library. In this example, we will use Howler.
Let's import the library at the top of the script:

```js
import { Howl } from 'https://cdn.skypack.dev/howler';
```

We can define associations between particular class labels and audio files:

```js
const mapping = [
  ['A', 'Trap Percussion FX Loop.mp3'],
  ['B', 'Trap Loop Minimal 2.mp3'],
  ['C', 'Trap Melody Full.mp3'],
];
```

Then, load and play the audio files in a loop:

```js
// Load audio files
let numLoaded = 0;
const sounds = mapping.map(([label, src]) => new Howl({ src: [src], loop: true, volume: 0 }));
const onload = () => {
  numLoaded += 1;
  if (numLoaded === 3) {
    for (const x of sounds) {
      x.play();
    }
  }
};
for (const s of sounds) {
  s.once('load', onload);
}
```

Then, we can add a switch widget to toggle music playback on the prediction page:

```js
const toggleSound = marcelle.toggle('Toggle Music');

// ...

myDashboard.page('Real-Time').sidebar(input).use(toggleSound, predViz);
```

Finally, we can take the stream of recognition results (`$predictions`), and use it to control the sound playback. Rather than just switching from one class to another every time the label changes, we can use the _confidences_ to continuously drive the level of each audio track:

```js
$predictions.subscribe(async ({ confidences }) => {
  for (const [i, [label]] of mapping.entries()) {
    sounds[i].volume((confidences[label] || 0) * toggleSound.$checked.value);
  }
});
```

::: details Full Code

```js
import * as marcelle from 'https://unpkg.com/@marcellejs/core@0.5.1/dist/marcelle.bundle.esm.js';
import { Howl } from 'https://cdn.skypack.dev/howler';

const mapping = [
  ['A', 'Trap Percussion FX Loop.mp3'],
  ['B', 'Trap Loop Minimal 2.mp3'],
  ['C', 'Trap Melody Full.mp3'],
];

const input = marcelle.webcam();
const featureExtractor = marcelle.mobileNet();

const label = marcelle.textInput();
label.title = 'Instance label';

const capture = marcelle.button('Click to record an instance');
capture.title = 'Hold to record images';

const $instances = input.$images
  .filter(() => capture.$pressed.value)
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    y: label.$value.value,
    thumbnail: input.$thumbnails.value,
  }))
  .awaitPromises();

const store = marcelle.dataStore('localStorage');
const trainingSet = marcelle.dataset('TrainingSet', store);
const trainingSetBrowser = marcelle.datasetBrowser(trainingSet);

$instances.subscribe(trainingSet.create.bind(trainingSet));

const classifier = marcelle.mlpClassifier({ layers: [32, 32], epochs: 20 });
const trainingButton = marcelle.button('Train');

trainingButton.$click.subscribe(() => {
  classifier.train(trainingSet);
});

const plotTraining = marcelle.trainingPlot(classifier);

const $predictions = input.$images
  .map(async (img) => {
    const features = await featureExtractor.process(img);
    return classifier.predict(features);
  })
  .awaitPromises();

const predViz = marcelle.confidencePlot($predictions);

const myDashboard = marcelle.dashboard({
  title: 'My First Tutorial',
  author: 'Myself',
});

// Load audio files
let numLoaded = 0;
const sounds = mapping.map(([label, src]) => new Howl({ src: [src], loop: true, volume: 0 }));
const onload = () => {
  numLoaded += 1;
  if (numLoaded === 3) {
    for (const x of sounds) {
      x.play();
    }
  }
};
for (const s of sounds) {
  s.once('load', onload);
}

const toggleSound = marcelle.toggle('Toggle Music');

$predictions.subscribe(async ({ confidences }) => {
  for (const [i, [label]] of mapping.entries()) {
    sounds[i].volume((confidences[label] || 0) * toggleSound.$checked.value);
  }
});

myDashboard
  .page('Data Management')
  .sidebar(input, featureExtractor)
  .use([label, capture], trainingSetBrowser, trainingButton, plotTraining);

myDashboard.page('Real-Time').sidebar(input).use(toggleSound, predViz);

myDashboard.show();
```

:::

## Ressources

- [https://freesound.org/](https://freesound.org/): Freesound is a collaborative database of Creative Commons Licensed sounds.
