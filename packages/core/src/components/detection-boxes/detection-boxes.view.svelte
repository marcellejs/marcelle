<script lang="ts">
  import { onMount } from 'svelte';
  import type { ObjectDetectorResults } from '../../core';
  import { filter, type Observable } from 'rxjs';

  interface Props {
    imageStream: Observable<ImageData>;
    objectDetectionResults: Observable<ObjectDetectorResults>;
  }

  let { imageStream, objectDetectionResults }: Props = $props();

  onMount(() => {
    const mycan = document.getElementById('can') as HTMLCanvasElement;
    const ctx = mycan.getContext('2d');
    imageStream.pipe(filter((x) => !!x)).subscribe((img) => {
      mycan.height = img.height;
      mycan.width = img.width;
      ctx.putImageData(img, 0, 0);
    });
    objectDetectionResults.pipe(filter((x) => !!x)).subscribe(({ outputs }) => {
      for (const output of outputs) {
        ctx.font = `${Math.floor(mycan.width / 60)}px sans-serif`;
        const msg = `${output.confidence.toFixed(3)} ${output.class}`;
        const textSize = ctx.measureText(msg);
        ctx.beginPath();
        ctx.rect(...output.bbox);
        ctx.lineWidth = mycan.width / 300;
        ctx.strokeStyle = 'green';
        ctx.fillStyle = 'green';
        ctx.stroke();
        ctx.fillRect(
          output.bbox[0] - ctx.lineWidth / 2,
          output.bbox[1] > textSize.actualBoundingBoxAscent
            ? output.bbox[1] - textSize.actualBoundingBoxAscent - 1.5 * ctx.lineWidth
            : 0,
          textSize.width + ctx.lineWidth,
          textSize.actualBoundingBoxAscent + ctx.lineWidth,
        );
        ctx.fillStyle = 'white';
        ctx.fillText(
          msg,
          output.bbox[0],
          output.bbox[1] > textSize.actualBoundingBoxAscent
            ? output.bbox[1] - ctx.lineWidth
            : textSize.actualBoundingBoxAscent,
        );
      }
    });
  });
</script>

<canvas id="can" class="mcl:w-full mcl:max-w-full"></canvas>
