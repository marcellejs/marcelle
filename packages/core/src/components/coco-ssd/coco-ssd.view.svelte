<script lang="ts">
  import type { Stream } from '../../core';
  import { ViewContainer } from '@marcellejs/design-system';

  export let title: string;
  export let loading: Stream<boolean>;
  export let base: string;
</script>

<ViewContainer {title} loading={$loading}>
  <p class="p-2 text-sm text-gray-600">
    {#if $loading}&nbsp;{:else}COCO-SSD loaded with base {base}{/if}
  </p>
</ViewContainer>
