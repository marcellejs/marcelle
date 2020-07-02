<h2 align="center">Marcelle.js</h2>

<p align="center"> A framework for building interactive machine learning applications</p>
<div align="center">

  [![Status](https://img.shields.io/badge/status-active-success.svg)]()
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

## About

Marcelle is an experimental framework for building interactive machine learning applications. Its compact API was design to support rapid prototyping of custom graphical user interfaces for interacting with the machine learning process. It allows users to manage datasets and train models, evaluate and compare their results, and interact in real-time with trained machine learning models. Marcelle can easily be extended through custom Vue components.

> Marcelle was designed as supporting material for the "Interactive Machine Learning" elective class of the Interaction specialty of Université Paris-Sud Master's degree.

[Full Documentation](https://marcelle.netlify.com)

### Installation

[See online documentation](https://marcelle.netlify.com/installation.html)

Using NPM:
```bash
npm install @marcellejs/core --save
```

Using Yarn:
```bash
yarn add @marcellejs/core
```

## Usage

[See the online documentation](https://marcelle.netlify.com/installation.html) for more examples:

```js
/* global marcelle */
const app = marcelle.create();

app.input.use(marcelle.inputs.Webcam);
app.input.use(marcelle.inputs.Mobilenet);

app.dataset('trainingSet');
app.dataset('validationSet');

app.model('knn').use(marcelle.models.KNN, { k: 4 });

app.prediction('knn');

app
  .tab('Training')
  .withDataset('trainingSet')
  .use(marcelle.data.DatasetCapture)
  .use(marcelle.data.DatasetBrowser)
  .withModel('knn')
  .use(marcelle.training.Parameters, { params: ['k', 'autotrain'] })
  .use(marcelle.training.Launcher);

app
  .tab('Real-time!')
  .withModel('knn')
  .withPrediction('knn')
  .use(marcelle.Button, {
    text: 'Toggle Real-time Interaction',
    onClick() {
      if (!this.$prediction.running) {
        this.$prediction.startOnlinePrediction(this.$model, () =>
          this.$input.getFeatures()
        );
      } else {
        this.$prediction.stopOnlinePrediction();
      }
    },
  })
  .use(marcelle.prediction.Label)
  .use(marcelle.prediction.Confidences);

app.run();
```

## ⛏️ Built Using
- [Tensorflow.js](https://js.tensorflow.org/)
- [VueJs](https://vuejs.org/)
- [Element-UI](https://element.eleme.io/#/en-US)
- [Apexcharts](Apexcharts)

## ✍️ Authors
- [@JulesFrancoise](https://github.com/JulesFrancoise)
- [@bcaramiaux/](https://github.com/bcaramiaux/)

## 🎉 Acknowledgements
- [Teachable Machine](https://teachablemachine.withgoogle.com/)
- [Wekinator](http://www.wekinator.org/)
