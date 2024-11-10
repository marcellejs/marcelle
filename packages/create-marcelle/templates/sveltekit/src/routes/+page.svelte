<script lang="ts">
  import { capture, input, label, trainingSet } from '$lib/marcelle';
  import { marcelle } from '$lib/utils.svelte';

  const count = trainingSet.$count;
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <h1>Welcome to Marcelle!</h1>
  <p>
    This template application illustrates how to integrate Marcelle pipelines and component in a web
    application.
  </p>

  <div class="marcelle notitles">
    <div use:marcelle={input}></div>
    <div>
      <div use:marcelle={label}></div>
      <div use:marcelle={capture}></div>
    </div>
    <p>You recorded {$count} instances</p>
  </div>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
  }

  h1 {
    width: 100%;
  }

  :global(.notitles .card-title) {
    display: none;
  }
</style>
