<script lang="ts">
  import type { MobileNetAlpha, MobileNetVersion } from '@tensorflow-models/mobilenet';
  import type { Stream } from '../../core';
  import { ViewContainer } from '@marcellejs/design-system';

  export let title: string;
  export let loading: Stream<boolean>;
  export let version: MobileNetVersion;
  export let alpha: MobileNetAlpha;
</script>

<ViewContainer {title} loading={$loading}>
  <p class="p-2 text-sm text-gray-600">
    {#if $loading}&nbsp;{:else}Using Mobilenet v{version} with alpha = {alpha}.{/if}
  </p>
</ViewContainer>
