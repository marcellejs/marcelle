<script>
  import ModuleBase from '../../core/ModuleBase.svelte';
  import Switch from '../../ui/widgets/Switch.svelte';

  export let title;
  export let text;
  export let checked;
  export let disabled;
</script>

<svelte:options accessors />

<ModuleBase {title}>
  <Switch bind:checked={$checked} bind:disabled={$disabled} bind:text={$text} />
</ModuleBase>
