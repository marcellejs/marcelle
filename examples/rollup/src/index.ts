import { createApp, createStream, webcam, capture, mobilenet, dataset } from '@marcellejs/core';
import { awaitPromises, map } from '@most/core';

const w = webcam();

const cap = capture({ input: w.$images, thumbnail: w.$thumbnails });
const m = mobilenet();

const instances = createStream(
  awaitPromises(
    map(
      async (instance: Record<string, unknown>) => ({
        ...instance,
        type: 'image',
        features: await m.process(instance.data),
      }),
      cap.$instances,
    ),
  ),
);
const trainingSet = dataset({ name: 'TrainingSet' });
trainingSet.capture(instances);

const app = createApp({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
});
app.dashboard('Data Management').useLeft(w, m).use(cap, trainingSet);

app.start();
