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

// const bro = marcelle.browser({ dataset: trainingSet });

const app = marcelle.createApp({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
});
app.dashboard('Data Management').useLeft(w, mobilenet).use(cap, trainingSet);
// app.dashboard('Love on the beat').use(cap);

app.start();

// //////////////////////////////////
