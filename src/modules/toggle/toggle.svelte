<script lang="ts">
  import type { Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';
  import Switch from '../../ui/components/Switch.svelte';

  export let title: string;
  export let text: Stream<string>;
  export let checked: Stream<boolean>;
  export let disabled: Stream<boolean>;

</script>

<ModuleBase {title}>
  <Switch bind:checked={$checked} bind:disabled={$disabled} bind:text={$text} />
</ModuleBase>
