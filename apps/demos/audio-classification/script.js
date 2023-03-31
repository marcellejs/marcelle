import '@marcellejs/core/dist/marcelle.css';
import { dashboard, microphone } from '@marcellejs/core';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = microphone();
const dash = dashboard({
  title: 'Marcelle Example - Audio Classification',
  author: 'Marcelle Pirates Crew',
});

dash.page('Data Management').sidebar(input);
// dash.settings.dataStores(store).datasets(trainingSet).models(classifier).predictions(batchMLP);

dash.show();
