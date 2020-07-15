<script>
  export let title;
  export let text;
</script>

<svelte:options accessors />

<span class="card-title">{title}</span>
<button on:click>{$text}</button>
