/* global marcelle, mostCore */

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = marcelle.webcam();
const featureExtractor = marcelle.mobilenet();

const labelInput = marcelle.textfield();
labelInput.name = 'Instance label';
const capture = marcelle.button({ text: 'Hold to record instances' });
capture.name = 'Capture instances to the training set';

const instances = input.$images
  .thru(mostCore.filter(() => capture.$down.value))
  .thru(
    mostCore.map(async (img) => ({
      type: 'image',
      data: img,
      label: labelInput.$text.value,
      thumbnail: input.$thumbnails.value,
      features: await featureExtractor.process(img),
    })),
  )
  .thru(mostCore.awaitPromises);

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
});

dashboard
  .page('Data Management')
  .useLeft(input, featureExtractor)
  .use([labelInput, capture], trainingSetBrowser);
dashboard.page('Training').use(params, b, prog, plotTraining);
dashboard.page('Batch Prediction').use(predictButton, confusionMatrix);
dashboard.page('Real-time Prediction').useLeft(input).use(tog, plotResults);
dashboard.settings.use(trainingSet);

// -----------------------------------------------------------
// WIZARD
// -----------------------------------------------------------

const wizardButton = marcelle.button({ text: 'Record Examples (class a)' });
const wizardText = marcelle.text({ text: 'Waiting for examples...' });
wizardButton.$down.subscribe((x) => {
  capture.$down.set(x);
});
trainingSet.$countPerClass.subscribe((c) => {
  const label = labelInput.$text.value;
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
  .title('Train the model')
  .description('Now that we have collected images, we can train the model from these examples.')
  .use(b, prog)
  .step()
  .title('Test the classifier')
  .description('Reproduce your gestures to test if the classifier works as expected')
  .use([input, plotResults]);

function configureWizard(label) {
  labelInput.$text.set(label);
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
  }
  if (stepIndex === 3) {
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

function startCamera() {
  input.$active.set(true);
  document.body.removeEventListener('mousemove', startCamera);
}
document.body.addEventListener('mousemove', startCamera);

// Update the GIFs with real-time recognition
const d = document.querySelector('#results');
const resultImg = document.querySelector('#result-img');

let PrevLabel = '';
predictionStream.subscribe(async ({ label }) => {
  if (label !== PrevLabel) {
    d.innerText = `predicted label: ${label}`;
    resultImg.src =
      label === 'A'
        ? 'https://media.giphy.com/media/zlVf2eSgXIFFuTnEhz/giphy.gif'
        : 'https://media.giphy.com/media/Oc8lIQHZsXqDu/giphy.gif';
    PrevLabel = label;
  }
});
