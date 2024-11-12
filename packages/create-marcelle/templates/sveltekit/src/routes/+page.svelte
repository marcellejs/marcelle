<script lang="ts">
  import { capture, input, label, trainingSet } from '$lib/marcelle';
  import { marcelle } from '$lib/utils.svelte';

  const count = trainingSet.$count;
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <div class="prose">
    <h1>Welcome to Marcelle!</h1>
    <p>
      This template application illustrates how to integrate Marcelle pipelines
      and component in a web application.
    </p>
  </div>

  <div class="flex flex-col justify-center items-center flex-1">
    <div use:marcelle={input}></div>
    <div class="flex gap-2">
      <div use:marcelle={label}></div>
      <div use:marcelle={capture}></div>
    </div>
    <p>You recorded {$count} instances</p>
  </div>
</section>

<style>
  section {
    width: 100%;
    max-width: var(--column-width);
    margin: var(--column-margin-top) auto 0 auto;
  }
</style>
