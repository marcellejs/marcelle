<script lang="ts">
  import Select from '../../ui/components/Select.svelte';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import type { Stream } from '../../core';

  export let title: string;
  export let options: Stream<string[]>;
  export let value: Stream<string>;

  function updateStream({ detail }: CustomEvent) {
    value.set(detail);
  }
</script>

<ViewContainer {title}>
  <Select options={$options} value={$value} on:change={updateStream} />
</ViewContainer>
