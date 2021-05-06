<script lang="ts">
  import { onMount } from 'svelte';
  import type { ObjectDetectorResults, Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title: string;
  export let imageStream: Stream<ImageData>;
  export let objectDetectionResults: Stream<ObjectDetectorResults>;

  onMount(() => {
    const mycan = document.getElementById('can') as HTMLCanvasElement;
    const ctx = mycan.getContext('2d');
    imageStream.subscribe((img) => {
      mycan.height = img.height;
      mycan.width = img.width;
      ctx.putImageData(img, 0, 0);
    });
    objectDetectionResults.subscribe(({ outputs }) => {
      for (let i = 0; i < outputs.length; i++) {
        ctx.font = `${Math.floor(mycan.width / 60)}px sans-serif`;
        const msg = `${outputs[i].confidence.toFixed(3)} ${outputs[i].class}`;
        const textSize = ctx.measureText(msg);
        ctx.beginPath();
        ctx.rect(...outputs[i].bbox);
        ctx.lineWidth = mycan.width / 300;
        ctx.strokeStyle = 'green';
        ctx.fillStyle = 'green';
        ctx.stroke();
        ctx.fillRect(
          outputs[i].bbox[0] - ctx.lineWidth / 2,
          outputs[i].bbox[1] > textSize.actualBoundingBoxAscent
            ? outputs[i].bbox[1] - textSize.actualBoundingBoxAscent - 1.5 * ctx.lineWidth
            : 0,
          textSize.width + ctx.lineWidth,
          textSize.actualBoundingBoxAscent + ctx.lineWidth,
        );
        ctx.fillStyle = 'white';
        ctx.fillText(
          msg,
          outputs[i].bbox[0],
          outputs[i].bbox[1] > textSize.actualBoundingBoxAscent
            ? outputs[i].bbox[1] - ctx.lineWidth
            : textSize.actualBoundingBoxAscent,
        );
      }
    });
  });
</script>

<ModuleBase {title}><canvas id="can" class="w-full max-w-full" /></ModuleBase>
