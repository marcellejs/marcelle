/* global marcelle */

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = marcelle.imageDrop();
const cocoClassifier = marcelle.cocoSsd();

// -----------------------------------------------------------
// CAPTURE TO DATASET
// -----------------------------------------------------------

const instances = source.$thumbnails.map((thumbnail) => ({
  type: 'image',
  data: source.$images.value,
  label: 'unlabeled',
  thumbnail,
}));

const backend = marcelle.createBackend({ location: 'memory' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend });

const tog = marcelle.toggle({ text: 'Capture to dataset' });
tog.$checked.skipRepeats().subscribe((x) => {
  if (x) {
    trainingSet.capture(instances);
  } else {
    trainingSet.capture(null);
  }
});

// -----------------------------------------------------------
// COCO REAL-TIME PREDICTION
// -----------------------------------------------------------

const cocoPredictionStream = source.$images
  .map(async (img) => cocoClassifier.predict(img))
  .awaitPromises();

const cocoBetterPredictions = cocoPredictionStream.map(({ outputs }) => ({
  label: outputs[0].class,
  confidences: outputs.reduce((x, y) => ({ ...x, [y.class]: y.confidence }), {}),
}));

const cocoPlotResults = marcelle.predictionPlot(cocoBetterPredictions);

// create new module?
const cocoInstanceViewer = {
  id: 'my-instance-viewer',
  mount(targetSelector) {
    const target = document.querySelector(targetSelector || '#my-instance-viewer');
    const instanceCanvas = document.createElement('canvas');
    instanceCanvas.classList.add('w-full', 'max-w-full');
    const instanceCtx = instanceCanvas.getContext('2d');
    target.appendChild(instanceCanvas);
    const unSub = source.$images.subscribe((img) => {
      instanceCanvas.width = img.width;
      instanceCanvas.height = img.height;
      instanceCtx.putImageData(img, 0, 0);
    });
    cocoPredictionStream.subscribe(({ outputs }) => {
      for (let i = 0; i < outputs.length; i++) {
        instanceCtx.beginPath();
        instanceCtx.rect(...outputs[i].bbox);
        instanceCtx.lineWidth = 3;
        instanceCtx.strokeStyle = 'green';
        instanceCtx.fillStyle = 'green';
        instanceCtx.stroke();
        instanceCtx.fillRect(
          outputs[i].bbox[0] - 2,
          outputs[i].bbox[1] > 10 ? outputs[i].bbox[1] - 5 - 10 : 10 - 10,
          100,
          14,
        );
        instanceCtx.fillStyle = 'white';
        instanceCtx.fillText(
          `${outputs[i].confidence.toFixed(3)} ${outputs[i].class}`,
          outputs[i].bbox[0],
          outputs[i].bbox[1] > 10 ? outputs[i].bbox[1] - 5 : 10,
        );
      }
    });
    this.destroy = () => {
      target.removeChild(instanceCanvas);
      unSub();
    };
  },
};

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle: Interactive Model Testing',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard.page('Real-time Testing').useLeft(source).use([cocoInstanceViewer, cocoPlotResults]);
dashboard.start();
