<script>
  export let loading = true;
</script>

<style lang="postcss">
  .webcam {
    @apply mt-2;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .webcam .webcam-container {
    @apply rounded-md overflow-hidden bg-gray-200 m-2;
    overflow: hidden;
    display: flex;
    justify-content: center;
  }

  video {
    transform: scaleX(-1);
  }
</style>

<span class="card-title">Mobilenet</span>
{#if loading}
  <div class="w-full h-full fixed block top-0 left-0 bg-white opacity-75 z-50">
    <span
      class="text-green-500 opacity-75 top-1/2 my-0 mx-auto block relative w-0 h-0"
      style=" top: 50%; ">
      <i class="fas fa-circle-notch fa-spin fa-5x" />
    </span>
  </div>
{:else}
  <p>Using Mobilenet vX with alpha = X.</p>
{/if}
