import { dash } from './common';
import { button, dataset, datasetTable, text, logger } from '@marcellejs/core';
import * as sentences from './sentences.json';
// import { setup as setupData } from './data';
// import { setup as setupScatter } from './scatterplot';
// import { setup as setupCharts } from './charts';
// import { setup as setupTraining } from './training';
// import { setup as setupTesting } from './testing';
// import { setup as setupBatch } from './batch-prediction';

// setupData(dash);
// setupScatter(dash);
// setupCharts(dash);
// setupTraining(dash);
// setupTesting(dash);
// setupBatch(dash);

import { sentenceEncoder } from '../../../packages/core';
// import './testing';

const encoder = sentenceEncoder();
const loadDataBtn = button('Load Data');
const info = text('');
// const result = text('')
const s = sentences.default;
loadDataBtn.$click.subscribe(() => {
  // logger.log(i)
  // console.log(sentences.default)
  s.forEach(i => info.$value.set(info.$value.get() + i));
})

const encodeBtn = button ('Get Embeddings');
encodeBtn.$click.subscribe(async() => {
  const res = await encoder.process(s);
  logger.log(res);
})

dash.page("sentenceEncoder").sidebar(encoder, loadDataBtn, info, encodeBtn);

dash.show();
