<script>
  import { onDestroy, onMount } from 'svelte';

  export let id;
  export let imageStream;
  export let objectDetectionResults;
  let can;

  onMount(() => {
    const mycan = document.getElementById('can');
    const ctx = mycan.getContext('2d');
    imageStream.subscribe((img) => {
      console.log(img);
      console.log(img.value);
      mycan.height = img.height;
      mycan.width = img.width;
      ctx.putImageData(img, 0, 0);
    });
    objectDetectionResults.subscribe(({ outputs }) => {
      for (let i = 0; i < outputs.length; i++) {
        ctx.beginPath();
        ctx.rect(...outputs[i].bbox);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'green';
        ctx.fillStyle = 'green';
        ctx.stroke();
        ctx.fillRect(
          outputs[i].bbox[0] - 2,
          outputs[i].bbox[1] > 10 ? outputs[i].bbox[1] - 5 - 10 : 10 - 10,
          100,
          14,
        );
        ctx.fillStyle = 'white';
        ctx.fillText(
          `${outputs[i].confidence.toFixed(3)} ${outputs[i].class}`,
          outputs[i].bbox[0],
          outputs[i].bbox[1] > 10 ? outputs[i].bbox[1] - 5 : 10,
        );
      }
    });
  });
</script>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-1">
  <!-- <div id={lossId} class="card flex-none xl:flex-1 w-full" />
  <div id={accId} class="card flex-none xl:flex-1 w-full" /> -->
  <canvas id="can" />
</div>
