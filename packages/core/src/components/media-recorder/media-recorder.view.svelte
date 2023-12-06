<script lang="ts">
  import { onMount } from 'svelte';
  import type { Stream } from '../../core';
  import { ViewContainer } from '@marcellejs/design-system';
  import { throwError } from '../../utils';
  import { getBlobMeta } from './blob-utils';
  import fixWebmDuration from 'fix-webm-duration';

  export let title: string;
  export let mediaStream: Stream<MediaStream>;
  export let active: Stream<boolean>;
  export let recordings: Stream<{
    duration: number;
    blob: Blob;
    type: string;
    thumbnail: string;
  }>;

  let recorder: MediaRecorder;
  let elapsedTime = '';
  let thumbnail = '';

  function checkRecorder(): void {
    if (!recorder) {
      const e = new Error('Cannot find an input MediaStream');
      e.name = 'Check if your input device is active';
      throwError(e);
    }
  }

  function startRecording() {
    const data: Blob[] = [];

    recorder.ondataavailable = (event) => data.push(event.data);
    recorder.start();

    const startTime = Date.now();
    elapsedTime = '00:00:00';
    const intvId = setInterval(() => {
      const interval = new Date(Date.now() - startTime);
      const hours = interval.getUTCHours().toString().padStart(2, '0');
      const minutes = interval.getUTCMinutes().toString().padStart(2, '0');
      const seconds = interval.getSeconds().toString().padStart(2, '0');

      elapsedTime = `${hours}:${minutes}:${seconds}`;
    }, 1000);

    let stopped = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recorder.onerror = (event: any) => reject(event.name);
    });

    return stopped
      .then(() => {
        clearInterval(intvId);
        const recordedBlob = new Blob(data, { type: data[0].type.split(';')[0] });
        return Promise.all([recordedBlob, getBlobMeta(recordedBlob)]);
      })
      .then(([blob, [duration, thumb]]) => {
        return Promise.all([fixWebmDuration(blob, duration, { logger: false }), duration, thumb]);
      })
      .then(([blob, duration, thumb]) => {
        thumbnail = thumb;
        recordings.set({
          blob: blob,
          type: blob.type,
          duration,
          thumbnail,
        });
        return data;
      });
  }

  onMount(() => {
    mediaStream
      .filter((s) => !!s)
      .subscribe((s) => {
        if (recorder && recorder.state === 'recording') {
          recorder.stop();
        }
        recorder = new MediaRecorder(s);
      });
    active.subscribe((shouldRecord) => {
      if (shouldRecord) {
        try {
          checkRecorder();
          startRecording();
        } catch (error) {
          active.set(false);
        }
      } else {
        recorder?.stop();
      }
    });
  });
</script>

<ViewContainer {title}>
  <div class="flex flex-col items-center">
    <!-- <button on:click={toggleRecord}>{$active ? 'Stop' : 'Record'}</button> -->
    <div class="recorder-container">
      <input type="checkbox" id="btn" bind:checked={$active} />
      <label for="btn" />
    </div>
    <div class="text-gray-600">{elapsedTime}</div>
    <!-- <img src={thumbnail} alt="" /> -->
  </div>
</ViewContainer>

<style lang="postcss">
  @keyframes stop {
    70% {
      border-radius: 6px;
      position: absolute;
      left: 50%;
      top: 50%;
      width: 40%;
      height: 40%;
      margin: -20% -20%;
    }
    100% {
      border-radius: 6px;
      position: absolute;
      left: 50%;
      top: 50%;
      width: 44%;
      height: 44%;
      margin: -22% -22%;
    }
  }
  .recorder-container {
    @apply relative w-full flex items-center justify-center;
    width: 80px;
    height: 80px;
  }
  .recorder-container #btn {
    display: none;
  }
  .recorder-container #btn + label:before {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 80%;
    height: 80%;
    margin: -40% -40%;
    content: '';
    border-radius: 50%;
    border: 2px solid #575757;
    cursor: pointer;
  }
  .recorder-container #btn + label:after {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 60%;
    height: 60%;
    margin: -30% -30%;
    content: '';
    border-radius: 30px;
    background: #e80415;
    cursor: pointer;
  }
  .recorder-container #btn:checked + label:after {
    -webkit-animation: stop 0.5s infinite cubic-bezier(0.4, -0.9, 0.9, 1);
    -moz-animation: stop 0.5s infinite cubic-bezier(0.4, -0.9, 0.9, 1);
    -o-animation: stop 0.5s infinite cubic-bezier(0.4, -0.9, 0.9, 1);
    animation: stop 0.5s infinite cubic-bezier(0.4, -0.9, 0.9, 1);
    -webkit-animation-iteration-count: 1;
    animation-iteration-count: 1;
    -webkit-animation-fill-mode: forwards;
    animation-fill-mode: forwards;
  }
</style>
