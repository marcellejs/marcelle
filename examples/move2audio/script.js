/* global marcelle, mostCore, Howl */

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = marcelle.webcam();
const featureExtractor = marcelle.mobilenet();

const cap = marcelle.capture({ input: input.$images, thumbnail: input.$thumbnails });
const instances = marcelle.createStream(
  mostCore.awaitPromises(
    mostCore.map(
      async (instance) => ({
        ...instance,
        type: 'image',
        features: await featureExtractor.process(instance.data),
      }),
      cap.$instances,
    ),
  ),
);

// const instances = cap.$instances
//   .map(async (instance) => ({
//     ...instance,
//     type: 'image',
//     features: await m.process(instance.data),
//   }))
//   .awaitPromises();

const backend = marcelle.createBackend({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend });
trainingSet.capture(instances);

const trainingSetBrowser = marcelle.browser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = marcelle.button({ text: 'Train' });
const classifier = marcelle.mlp({ layers: [64, 32], epochs: 20 });
b.$click.subscribe(() => classifier.train(trainingSet));

const params = marcelle.parameters(classifier);
const prog = marcelle.progress(classifier);
const plotTraining = marcelle.trainingPlotter(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = marcelle.batchPrediction({ name: 'mlp', backend });
const confusionMatrix = marcelle.confusion(batchMLP);

const predictButton = marcelle.button({ text: 'Update predictions' });
predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = marcelle.toggle({ text: 'toggle prediction' });

const predictionStream = marcelle.createStream(
  mostCore.awaitPromises(
    mostCore.map(
      async (img) => classifier.predict(await featureExtractor.process(img)),
      mostCore.filter(() => tog.$checked.value, input.$images),
    ),
  ),
);

// const predictionStream = input.$images
//   .filter(() => tog.$checked.value)
//   .map(async (img) => classifier.predict(await m.process(img)))
//   .awaitPromises();

const plotResults = marcelle.predictionPlotter(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle Example - Wizard',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard.page('Data Management').useLeft(input, featureExtractor).use(cap, trainingSetBrowser);
dashboard.page('Training').use(params, b, prog, plotTraining);
dashboard.page('Batch Prediction').use(predictButton, confusionMatrix);
dashboard.page('Real-time Prediction').useLeft(input).use(tog, plotResults);

// -----------------------------------------------------------
// WIZARD
// -----------------------------------------------------------

const wizardButton = marcelle.button({ text: 'Record Examples (class a)' });
const wizardText = marcelle.text({ text: 'Waiting for examples...' });
wizardButton.$down.subscribe((x) => {
  cap.$capturing.set(x);
});
trainingSet.$countPerClass.subscribe((c) => {
  const label = cap.$label.value;
  const numExamples = c[label];
  wizardText.$text.set(
    numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
  );
});

const wizard = marcelle.createWizard();

wizard
  .step()
  .title('Record examples for class A')
  .description('Hold on the record button to capture training examples for class A')
  .use(input, wizardButton, wizardText)
  .step()
  .title('Record examples for class B')
  .description('Hold on the record button to capture training examples for class B')
  .use(input, wizardButton, wizardText)
  .step()
  .title('Record examples for class C')
  .description('Hold on the record button to capture training examples for class C')
  .use(input, wizardButton, wizardText)
  .step()
  .title('Train the model')
  .description('Now that we have collected images, we can train the model from these examples.')
  .use(b, prog)
  .step()
  .title('Test the classifier')
  .description('Reproduce your gestures to test if the classifier works as expected')
  .use([input, plotResults]);

function configureWizard(label) {
  cap.$label.set(label);
  wizardButton.$text.set(`Record Examples (class ${label})`);
  const numExamples = trainingSet.$countPerClass.value[label];
  wizardText.$text.set(
    numExamples ? `Recorded ${numExamples} examples of "${label}"` : 'Waiting for examples...',
  );
}

wizard.$current.subscribe((stepIndex) => {
  if (stepIndex === 0) {
    configureWizard('A');
  } else if (stepIndex === 1) {
    configureWizard('B');
  } else if (stepIndex === 2) {
    configureWizard('C');
  }
  if (stepIndex === 4) {
    tog.$checked.set(true);
  } else {
    tog.$checked.set(false);
  }
});

// -----------------------------------------------------------
// MAIN APP
// -----------------------------------------------------------

// Setup the webcam
input.$mediastream.subscribe((s) => {
  document.querySelector('#my-webcam').srcObject = s;
});

setTimeout(() => {
  input.$active.set(true);
}, 200);

// Load audio files
let numLoaded = 0;
const sounds = [
  'Trap Percussion FX Loop.mp3',
  'Trap Loop Minimal 2.mp3',
  'Trap Melody Full.mp3',
].map((x) => new Howl({ src: [x], loop: true, volume: 0 }));
sounds.forEach((s) =>
  s.once('load', () => {
    numLoaded += 1;
    if (numLoaded === 3) {
      sounds.forEach((x) => x.play());
    }
  }),
);

// Update the GIFs with real-time recognition
const d = document.querySelector('#results');
const resultImg = document.querySelector('#result-img');

let PrevLabel = '';
predictionStream.subscribe(async ({ label, confidences }) => {
  if (label !== PrevLabel) {
    d.innerText = `predicted label: ${label}`;
    if (label === 'A') {
      resultImg.src = 'https://media.giphy.com/media/vVzH2XY3Y0Ar6/giphy.gif';
    } else if (label === 'B') {
      resultImg.src = 'https://media.giphy.com/media/IhvYFmzVNHgCQ/giphy.gif';
    } else {
      resultImg.src = 'https://media.giphy.com/media/sphmLQaP0wAdG/giphy.gif';
    }
    PrevLabel = label;
  }
  Object.values(confidences).forEach((x, i) => {
    sounds[i].volume(x);
  });
});
