<script>
  export let title;
  export let size;
  export let frames;
</script>

<span class="card-title">{title}</span>
<p>size: {size}</p>
{#if $frames}
  <p>values: [{$frames.map(x => x.toFixed(2)).join(' ; ')}]</p>
{/if}
