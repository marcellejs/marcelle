/* global marcelle */

//////////////////////////////////

// const f = marcelle.faker({ size: 3 });
// // f.out.frames.subscribe(console.log);

// const cap = marcelle.capture({ input: f.out.frames });
// const instances = cap.out.instances;
// const trainingSet = marcelle.dataset({ name: 'TrainingSet' });
// trainingSet.capture(instances);

// const app = marcelle.createApp({
//   title: 'Marcelle Starter',
//   author: 'Marcelle Pirates Crew',
// });
// app.dashboard('Data Management').useLeft(f).use(cap, trainingSet);
// app.dashboard('Love on the beat').use(cap);
// app.start();

//////////////////////////////////

const w = marcelle.webcam();
const cap = marcelle.capture({ input: w.out.images, thumbnail: w.out.thumbnails });
const trainingSet = marcelle.dataset({ name: 'TrainingSet' });
trainingSet.capture(cap.out.instances);

const app = marcelle.createApp({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
});
app.dashboard('Data Management').useLeft(w).use(cap, trainingSet);

app.start();

//////////////////////////////////

// const w = marcelle.webcam();

// const cap = marcelle.capture({ input: w.out.images, thumbnail: w.out.thumbnails });
// const instances = cap.out.instances;
// // const mobilenet = marcelle.mobilenet();
// // const instances = cap.out.instances.pipe(
// //   map((instance) => ({
// //     ...instance,
// //     type: 'image',
// //     features: mobilenet(instance.data),
// //   })),
// // );
// const trainingSet = marcelle.dataset({ name: 'TrainingSet' });
// trainingSet.capture(instances);
// trainingSet.out.instances.subscribe(console.log);

// // const bro = marcelle.browser({ dataset: trainingSet });

// const app = marcelle.createApp({
//   title: 'Marcelle Starter',
//   author: 'Marcelle Pirates Crew',
// });
// app.dashboard('Data Management').useLeft(w).use(cap, trainingSet);
// // app.dashboard('Love on the beat').use(cap);

// app.start();

// //////////////////////////////////
