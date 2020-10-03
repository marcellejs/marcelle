/* eslint-disable import/extensions */
/* global marcelle, mostCore, tf */
import { displayImage } from './visualization.js';
import { GanTrainer, plotGanTraining } from './training.js';
// import { GanTrainer, plotGanTraining } from './training_emulator.js';
import { loadModel, predict, generateNoise, downsampleCamera } from './generation.js';

// Create a GAN model trainer, that communicates with a Python training backend
const gan = new GanTrainer({ epochs: 30000 });
const [plotLosses, plotAccuracy] = plotGanTraining(gan);

const trainingLauncher = marcelle.button({ text: 'Start Training' });
trainingLauncher.name = 'Training Launcher';
gan.$training
  .thru(mostCore.map((x) => x.status))
  .thru(mostCore.skipRepeats)
  .subscribe((x) => {
    if (['start', 'epoch'].includes(x)) {
      trainingLauncher.$text.set('Stop Training');
    } else {
      trainingLauncher.$text.set('Start Training');
    }
  });
trainingLauncher.$click.subscribe(() => {
  if (['start', 'epoch'].includes(gan.$training.value.status)) {
    gan.stop();
  } else {
    gan.train();
  }
});

const genButton = marcelle.button({ text: 'Generate an Image' });
const $imagesOneShot = genButton.$click.thru(generateNoise).thru(predict);

const w = marcelle.webcam({ width: 10, height: 10 });
const $wNoise = w.$images.thru(mostCore.filter(() => w.$ready.value)).thru(downsampleCamera);
const $imagesWebcam = $wNoise
  .thru(mostCore.map((input) => input.sub(tf.scalar(0.5).mul(tf.scalar(2))).reshape([1, 100])))
  .thru(predict);

const displayInput = displayImage($wNoise, 'Input Noise');

const displayResult = displayImage(
  $imagesOneShot.thru(mostCore.merge($imagesWebcam)),
  'Generated Image',
);

const selectModel = marcelle.select();
gan.$models.subscribe((x) => {
  selectModel.$options.set(x.map((y) => y.split('/')[1]));
});

const loadButton = marcelle.button({ text: 'Load Model' });
loadButton.name = 'Load model';
loadButton.$click.subscribe(async () => {
  loadButton.$loading.set(true);
  await loadModel(selectModel.$value.value);
  loadButton.$loading.set(false);
});

// const samples = marcelle.text();
// samples.name = 'Samples from the generator';
// samples.$text = gan.$training.thru(mostCore.filter((x) => x.sample)).thru(
//   mostCore.map(
//     (x) => `<p>Samples (Generated at epoch ${x.epoch})</p>
//       <img src="${x.sample}" class="w-full">`,
//   ),
// );

const p = document.createElement('p');
const img = document.createElement('img');
img.classList.add('w-full');
const samples = {
  id: 'gan-samples',
  name: 'Samples from the generator',
  mount(targetSelector) {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    target.appendChild(p);
    target.appendChild(img);
    this.destroy = () => {
      target.removeChild(p);
      target.removeChild(img);
    };
  },
  destroy() {},
};
samples.$text = gan.$training.thru(mostCore.filter((x) => x.sample)).subscribe((x) => {
  p.innerText = `Samples (Generated at epoch ${x.epoch})`;
  img.src = x.sample;
});

const dashboard = marcelle.createDashboard({
  title: 'Marcelle Example - GAN for Image Generation (MNIST)',
  author: 'Marcelle Pirates Crew',
});

dashboard.page('Train').useLeft(marcelle.parameters(gan), trainingLauncher).use(
  marcelle.progress(gan),
  samples, // [plotLosses, plotAccuracy]
);
dashboard.page('Simple').use([selectModel, loadButton], genButton, displayResult);
dashboard.page('Webcam').useLeft(w, displayInput).use([selectModel, loadButton], displayResult);

dashboard.start();
