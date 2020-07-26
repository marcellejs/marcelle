/* eslint-disable no-undef */

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const w = webcam();
const m = mobilenet();

const cap = capture({ input: w.$images, thumbnail: w.$thumbnails });
const instances = new Stream(
  awaitPromises(
    map(
      async (instance) => ({
        ...instance,
        type: 'image',
        features: await m.process(instance.data),
      }),
      cap.$instances,
    ),
  ),
);

const trainingSet = dataset({ name: 'TrainingSet', backend: 'localStorage' });
trainingSet.capture(instances);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
const classifier = mlp({ layers: [128, 64], epochs: 30 });
b.$click.subscribe(() => classifier.train(trainingSet));

const params = parameters(classifier);
const prog = progress(classifier);

// -----------------------------------------------------------
// PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });
const results = text({ text: 'waiting for predictions...' });

// eslint-disable-next-line @typescript-eslint/no-empty-function
let predictions = { stop() {} };
createStream(skipRepeats(tog.$checked)).subscribe((x) => {
  if (x) {
    predictions = createStream(
      awaitPromises(map(async (img) => classifier.predict(await m.process(img)), w.$images)),
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

const dashboard = createDashboard({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
});

dashboard.page('Data Management').useLeft(w, m).use(cap, trainingSet);
dashboard.page('Training').use(params, b, prog);
dashboard.page('Real-time prediction').useLeft(w).use(tog, results);

dashboard.start();
