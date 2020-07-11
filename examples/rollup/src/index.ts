import { createApp, webcam, capture, mobilenet, dataset } from '@marcellejs/core';
import { mergeMap } from 'rxjs/operators';

const w = webcam();
const cap = capture({ input: w.out.images, thumbnail: w.out.thumbnails });

const m = mobilenet();
const instances = cap.out.instances.pipe(
  mergeMap(async (instance: Record<string, unknown>) => ({
    ...instance,
    type: 'image',
    features: await m.process(instance.data),
  })),
  // rxjs.operators.tap(console.log),
);

const trainingSet = dataset({ name: 'TrainingSet' });
trainingSet.capture(instances);

const app = createApp({
  title: 'Marcelle + Rollup Starter',
  author: 'Marcelle Pirates Crew',
});
app.dashboard('Data Management').useLeft(w).use(cap, trainingSet);

app.start();
