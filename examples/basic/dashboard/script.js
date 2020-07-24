/* global marcelle mostCore */

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const w = marcelle.webcam();
const mobilenet = marcelle.mobilenet();

const cap = marcelle.capture({ input: w.$images, thumbnail: w.$thumbnails });
const instances = marcelle.createStream(
  mostCore.awaitPromises(
    mostCore.map(
      async (instance) => ({
        ...instance,
        type: 'image',
        features: await mobilenet.process(instance.data),
      }),
      cap.$instances,
    ),
  ),
);

const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend: 'localStorage' });
trainingSet.capture(instances);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = marcelle.button({ text: 'Train' });
const classifier = marcelle.mlp({ layers: [128, 64], epochs: 30 });
b.$click.subscribe(() => classifier.train(trainingSet));

const params = marcelle.parameters(classifier);
const prog = marcelle.progress(classifier);

// -----------------------------------------------------------
// PREDICTION
// -----------------------------------------------------------

const tog = marcelle.toggle({ text: 'toggle prediction' });
const results = marcelle.text({ text: 'waiting for predictions...' });

// eslint-disable-next-line @typescript-eslint/no-empty-function
let predictions = { stop() {} };
marcelle.createStream(mostCore.skipRepeats(tog.$checked)).subscribe((x) => {
  if (x) {
    predictions = marcelle.createStream(
      mostCore.awaitPromises(
        mostCore.map(async (img) => classifier.predict(await mobilenet.process(img)), w.$images),
      ),
    );
    predictions.subscribe((y) => {
      results.$text.set(
        `<h2>predicted label: ${y.label}</h2><p>Confidences: ${Object.values(
          y.confidences,
        ).map((z) => z.toFixed(2))}</p>`,
      );
    });
  } else {
    predictions.stop();
  }
});

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const app = marcelle.createApp({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
});

app.dashboard('Data Management').useLeft(w, mobilenet).use(cap, trainingSet);
app.dashboard('Training').use(params, b, prog);
app.dashboard('Real-time prediction').useLeft(w).use(tog, results);

app.start();
