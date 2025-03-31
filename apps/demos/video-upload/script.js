import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/gui-widgets/dist/marcelle-gui-widgets.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import {
  webcam,
  mediaRecorder,
  videoPlayer,
  // microphone,
  dataStore,
  dataset,
  datasetTable,
} from '@marcellejs/core';
import { dashboard } from '@marcellejs/layouts';
import { button, text } from '@marcellejs/gui-widgets';
import { filter, from, map, mergeMap, tap, withLatestFrom } from 'rxjs';

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

upload.$click.subscribe(async () => {
  upload.$loading.next(true);
  upload.$text.next('Uploading...');
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
    upload.$loading.next(false);
    upload.$text.next('Upload');
  }
});

const player = videoPlayer();

const loadVideo = button('Load Selected Video');
dst.$selection.pipe(map((x) => x.length !== 1)).subscribe((disabled) => {
  loadVideo.$disabled.next(disabled);
});
loadVideo.$click
  .pipe(
    withLatestFrom(dst.$selection),
    map((x) => x[1][0]),
    map((x) => x[0]),
    map((x) => ds.get(x.id)),
    mergeMap((x) => from(x)),
  )
  .subscribe((x) => {
    console.log('x', x);
    player.$src.next(store.location + x.file);
  });

recorder.$recordings
  .pipe(
    filter((x) => !!x),
    map(({ blob }) => URL.createObjectURL(blob)),
  )
  .subscribe((x) => {
    player.$src.next(x);
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
