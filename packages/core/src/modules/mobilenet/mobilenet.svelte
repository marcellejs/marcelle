<script>
  import Spinner from '../../core/components/Spinner.svelte';

  export let title;
  export let loading = true;
  export let version;
  export let alpha;
</script>

<span class="card-title">{title}</span>
{#if loading}
  <Spinner />
{:else}
  <p class="mt-6 p-2 text-sm text-gray-600">Using Mobilenet v{version} with alpha = {alpha}.</p>
{/if}
