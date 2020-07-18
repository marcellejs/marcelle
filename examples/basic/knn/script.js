/* global marcelle mostCore */

const w = marcelle.webcam();

const cap = marcelle.capture({ input: w.$images, thumbnail: w.$thumbnails });
const mobilenet = marcelle.mobilenet();
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
const trainingSet = marcelle.dataset({ name: 'TrainingSet' });
trainingSet.capture(instances);

const b = marcelle.button({ text: 'Train' });
const classifier = marcelle.mlp({ layers: [128, 64], epochs: 30 });
b.$click.subscribe(() => classifier.train(trainingSet));
classifier.$training.subscribe(console.log);

const tog = marcelle.toggle({ text: 'toggle prediction' });

// eslint-disable-next-line @typescript-eslint/no-empty-function
let predictions = { stop() {} };
tog.$checked.subscribe((x) => {
  if (x) {
    predictions = marcelle.createStream(
      mostCore.awaitPromises(
        mostCore.map(async (img) => classifier.predict(await mobilenet.process(img)), w.$images),
      ),
    );
    predictions.subscribe((y) => console.log('real-time features', y));
  } else {
    predictions.stop();
  }
});

const app = marcelle.createApp({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
});
app.dashboard('Data Management').useLeft(w, mobilenet).use(cap, trainingSet, b, tog);

app.start();
