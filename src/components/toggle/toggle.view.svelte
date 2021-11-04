<script lang="ts">
  import type { Stream } from '../../core';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import Switch from '../../ui/components/Switch.svelte';

  export let title: string;
  export let text: Stream<string>;
  export let checked: Stream<boolean>;
  export let disabled: Stream<boolean>;
</script>

<ViewContainer {title}>
  <Switch bind:checked={$checked} disabled={$disabled} text={$text} />
</ViewContainer>
