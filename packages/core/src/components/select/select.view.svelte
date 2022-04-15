<script lang="ts">
  import type { Stream } from '../../core';
  import { Select } from '@marcellejs/design-system';
  import { ViewContainer } from '@marcellejs/design-system';

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
