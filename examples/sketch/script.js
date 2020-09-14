/* global marcelle, mostCore */

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = marcelle.sketchpad();
const featureExtractor = marcelle.mobilenet();

const instances = marcelle.createStream(
  mostCore.awaitPromises(
    mostCore.map(
      async (instance) => ({
        ...instance,
        type: 'sketch',
        label: 'default',
        features: await featureExtractor.process(instance.data),
      }),
      mostCore.snapshot(
        (thumbnail, data) => ({ thumbnail, data }),
        input.$thumbnails,
        input.$images,
      ),
    ),
  ),
  true,
);

const backend = marcelle.createBackend({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend });
const labelField = marcelle.textfield();
labelField.name = 'Correct the prediction if necessary';
labelField.$text.set('...');
const addToDataset = marcelle.button({ text: 'Add to Dataset and Train' });
addToDataset.name = 'Improve the classifier';
trainingSet.capture(
  marcelle.createStream(
    mostCore.snapshot(
      (instance) => ({ ...instance, label: labelField.$text.value }),
      instances,
      addToDataset.$click,
    ),
  ),
);

const trainingSetBrowser = marcelle.browser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = marcelle.button({ text: 'Train' });
const classifier = marcelle.mlp({ layers: [64, 32], epochs: 20 });

b.$click.subscribe(() => classifier.train(trainingSet));
trainingSet.$created.subscribe(() => classifier.train(trainingSet));

const params = marcelle.parameters(classifier);
const prog = marcelle.progress(classifier);
const plotTraining = marcelle.trainingPlotter(classifier);

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const predictionStream = marcelle.createStream(
  mostCore.filter(
    (x) => !!x,
    mostCore.awaitPromises(
      mostCore.map(
        async ({ features }) => classifier.predict(features),
        mostCore.merge(
          instances,
          mostCore.sample(
            instances,
            mostCore.filter((x) => x.status === 'success', classifier.$training),
          ),
        ),
      ),
    ),
  ),
);
predictionStream.subscribe(({ label }) => {
  labelField.$text.set(label);
});

const plotResults = marcelle.predictionPlotter(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard
  .page('Online Learning')
  .useLeft(input, featureExtractor)
  .use(plotResults, [labelField, addToDataset], prog, trainingSetBrowser);
dashboard.page('Offline Training').useLeft(trainingSetBrowser).use(params, b, prog, plotTraining);

dashboard.start();

marcelle.createStream(mostCore.take(1, trainingSet.$count)).subscribe((c) => {
  if (c) {
    setTimeout(() => {
      classifier.train(trainingSet);
    }, 200);
  }
});
