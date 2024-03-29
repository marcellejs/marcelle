<script lang="ts">
  import { Switch, ViewContainer } from '@marcellejs/design-system';
  import { onDestroy, onMount } from 'svelte';
  import type { Stream } from '../../core';

  export let title: string;
  export let active: Stream<boolean>;
  export let mediaStream: Stream<MediaStream>;

  let canvasElt: HTMLCanvasElement;

  let unSub;
  let drawRequest = 0;
  let ctx: CanvasRenderingContext2D;
  const audioContext = new window.AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 4096;
  console.log('analyser.fftSize', analyser.fftSize);
  const timeDomain = new Uint8Array(analyser.fftSize);

  // stop default signal animation
  function stop() {
    if (drawRequest) {
      window.cancelAnimationFrame(drawRequest);
      drawRequest = 0;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  // draw signal
  function draw(x0 = 0, y0 = 0, width = ctx.canvas.width - x0, height = ctx.canvas.height - y0) {
    analyser.getByteTimeDomainData(timeDomain);
    const step = width / timeDomain.length;

    ctx.beginPath();
    // drawing loop (skipping every second record)
    for (let i = 0; i < timeDomain.length; i += 2) {
      const percent = timeDomain[i] / 256;
      const x = x0 + i * step;
      const y = y0 + height * percent;
      ctx.lineTo(x, y);
    }

    ctx.stroke();
  }

  function animate() {
    const drawLoop = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      draw();
      drawRequest = window.requestAnimationFrame(drawLoop);
    };
    drawLoop();
  }

  onMount(() => {
    ctx = canvasElt.getContext('2d');
    let source: MediaStreamAudioSourceNode;

    unSub = mediaStream.subscribe((stream) => {
      if (!stream) return;
      if (source) {
        source.disconnect();
        stop();
      }
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      animate();
    });
  });

  onDestroy(unSub);
</script>

<ViewContainer {title}>
  <div>
    <div>
      <Switch text="activate microphone" bind:checked={$active} />
    </div>
    <div>
      <canvas bind:this={canvasElt} class="w-full" />
    </div>
  </div>
</ViewContainer>

<style>
</style>
