import '../../dist/marcelle.css';
import {
  datasetBrowser,
  button,
  dashboard,
  dataset,
  dataStore,
  mlpClassifier,
  mobileNet,
  modelParameters,
  confidencePlot,
  notification,
  trainingProgress,
  sketchPad,
  textInput,
  trainingPlot,
} from '../../dist/marcelle.esm';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = sketchPad();
const featureExtractor = mobileNet();

const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet-sketch', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

const labelField = textInput();
labelField.title = 'Correct the prediction if necessary';
labelField.$text.set('...');
const addToDataset = button('Add to Dataset and Train');
addToDataset.title = 'Improve the classifier';

const $instances = input.$images
  .hold()
  .snapshot(
    async (thumbnail, img) => ({ thumbnail, x: await featureExtractor.process(img) }),
    input.$thumbnails,
  )
  .awaitPromises();

addToDataset.$click
  .sample($instances)
  .map((instance) => ({ ...instance, y: labelField.$text.value }))
  .subscribe(trainingSet.create.bind(trainingSet));

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button('Train');
const classifier = mlpClassifier({ layers: [64, 32], epochs: 20, dataStore: store });
classifier.sync('sketch-classifier');

b.$click.subscribe(() => classifier.train(trainingSet));

let countPerClass = {};
trainingSet.$changes.subscribe(async (changes) => {
  for (const { level, type, data } of changes) {
    if (level === 'instance' && type === 'created') {
      if (!(data.y in countPerClass)) countPerClass[data.y] = 0;
      countPerClass[data.y] += 1;
      if (Object.values(countPerClass).reduce((x, y) => x || y < 2, false)) {
        notification({
          title: 'Tip',
          message: 'You need to record at least two examples per class',
          duration: 5000,
        });
      } else if (Object.keys(countPerClass).length < 2) {
        notification({
          title: 'Tip',
          message: 'You need to have at least two classes to train the model',
          duration: 5000,
        });
      } else {
        classifier.train(trainingSet);
      }
      // classifier.train(trainingSet);
    } else if (level === 'instance' && type === 'removed') {
      countPerClass[data.y] -= 1;
      classifier.train(trainingSet);
    } else {
      const allInstances = await trainingSet.items().select(['y']).toArray();
      countPerClass = allInstances.reduce((cpc, { y }) => ({ ...cpc, [y]: (cpc[y] || 0) + 1 }), {});
    }
  }
});

const params = modelParameters(classifier);
const prog = trainingProgress(classifier);
const plotTraining = trainingPlot(classifier);

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const $predictions = classifier.$training
  .filter((x) => x.status === 'success')
  .sample($instances)
  .merge($instances)
  .map(({ x }) => classifier.predict(x))
  .awaitPromises()
  .filter((x) => !!x);

$predictions.subscribe(({ label }) => {
  labelField.$text.set(label);
});

const plotResults = confidencePlot($predictions);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Online Learning')
  .sidebar(input, featureExtractor)
  .use(plotResults, [labelField, addToDataset], prog, trainingSetBrowser);
dash.page('Offline Training').sidebar(trainingSetBrowser).use(params, b, prog, plotTraining);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier, featureExtractor);

dash.show();

// -----------------------------------------------------------
// HELP MESSAGES
// -----------------------------------------------------------

input.$images
  .filter(() => trainingSet.$count.value === 0 && !classifier.ready)
  .take(1)
  .subscribe(() => {
    notification({
      title: 'Tip',
      message: 'Start by editing the label and adding the drawing to the dataset',
      duration: 5000,
    });
  });
