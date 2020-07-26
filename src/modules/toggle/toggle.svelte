<script>
  import Switch from '../../ui/widgets/Switch.svelte';

  export let title;
  export let text;
  export let checked;
  export let disabled;
</script>

<svelte:options accessors />

<span class="card-title">{title}</span>
<Switch bind:checked={$checked} bind:disabled={$disabled} bind:text={$text} />
