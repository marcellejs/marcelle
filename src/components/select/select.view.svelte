<script lang="ts">
  import Select from '../../ui/components/Select.svelte';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import type { Stream } from '../../core';

  export let title: string;
  export let options: Stream<string[]>;
  export let value: Stream<string>;

</script>

<ViewContainer {title}>
  <Select options={$options} bind:value={$value} />
</ViewContainer>
