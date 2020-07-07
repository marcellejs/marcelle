/* global marcelle */

const app = marcelle.createApp({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
});

const f = marcelle.faker({ size: 3 });
// f.out.frames.subscribe(console.log);

const cap = marcelle.capture({ input: f.out.frames });
const trainingSet = marcelle.dataset({ name: 'TrainingSet' });
trainingSet.capture(cap.out.instances);

app.dashboard('Data Management').useLeft(f).use(cap, trainingSet);
app.dashboard('Love on the beat').use(cap);

app.start();
