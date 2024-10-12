import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/gui-widgets/dist/marcelle-gui-widgets.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import {
  dashboard,
  webcam,
  mediaRecorder,
  videoPlayer,
  // microphone,
  dataStore,
  dataset,
  datasetTable,
} from '@marcellejs/core';
import { button, text } from '@marcellejs/gui-widgets';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

// const input = microphone();
const input = webcam({ audio: true });
const recorder = mediaRecorder();
recorder.$mediaStream = input.$mediastream;

recorder.$recordings.subscribe(console.log);

const upload = button('Upload');

const store = dataStore('http://localhost:3030');
const ds = dataset('videos', store);
const dst = datasetTable(ds, ['id', 'thumbnail', 'duration', 'createdAt']);
dst.$selection.subscribe;

upload.$click.subscribe(async () => {
  upload.$loading.set(true);
  upload.$text.set('Uploading...');
  try {
    const { blob, type, duration, thumbnail } = recorder.$recordings.get();
    const filePath = await store.uploadAsset(blob);
    console.log('filePath', filePath);
    ds.create({
      file: filePath,
      type,
      duration,
      thumbnail,
    });
  } catch (err) {
    console.log(err.message);
  } finally {
    upload.$loading.set(false);
    upload.$text.set('Upload');
  }
});

const player = videoPlayer();

const loadVideo = button('Load Selected Video');
dst.$selection
  .map((x) => x.length !== 1)
  .subscribe((disabled) => {
    loadVideo.$disabled.set(disabled);
  });
loadVideo.$click
  .sample(dst.$selection)
  .map((x) => x[0])
  .map((x) => ds.get(x.id))
  .awaitPromises()
  .subscribe((x) => {
    console.log('x', x);
    player.$src.set(store.location + x.file);
  });

recorder.$recordings
  .map(({ blob }) => URL.createObjectURL(blob))
  .subscribe((x) => {
    player.$src.set(x);
  });

const dash = dashboard({
  title: 'Marcelle Example - Audio Classification',
  author: 'Marcelle Pirates Crew',
});

const hint = text('You need a local backend running');
hint.title = 'hint';
dash.page('Data Management').sidebar(input, recorder, hint).use(player, upload);
dash.page('My Data').use(dst, loadVideo, player);

dash.show();
