<script>
  import ModuleBase from '../../core/ModuleBase.svelte';
  import { onMount } from 'svelte';

  export let title;
  export let img;
  export let loading;
  let mycanvas;
  var rightPressed = false;
  var leftPressed = false;
  var paddleHeight = 10;
  var paddleWidth = 75;
  var paddleX = 0;

  // window.onload = function () {
  //   // const ctx = canvas.getContext('2d');
  //   if ($img)
  //   const instanceCanvas = document.getElementById('mycan');
  //   const instanceCtx = instanceCanvas.getContext('2d');
  //   instanceCtx.putImageData($img.value, 100, 100);
  // };
  // onMount(() => {
  //   mycanvas.putImageData($img, 0, 0);
  // });

  // export let version;
  // export let alpha;

  // window.onload = function () {
  //   const instanceCanvas = document.getElementById('mycan');
  //   instanceCanvas.classList.add('w-full', 'max-w-full');
  //   const instanceCtx = instanceCanvas.getContext('2d');
  //   instanceCanvas.width = img.width;
  //   instanceCanvas.height = img.height;
  //   instanceCtx.putImageData(img.value, 0, 0);
  // };
</script>

<ModuleBase {title} loading={$loading}>
  <!-- <p class="p-2 text-sm text-gray-600">yo</p> -->
  <!-- <canvas bind:this={mycanvas} src="./test.jpg" /> -->
  <!-- <canvas id="mycan" /> -->
</ModuleBase>
