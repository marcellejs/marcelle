<script lang="ts">
  import type { MobileNetAlpha, MobileNetVersion } from '@tensorflow-models/mobilenet';
  import { ViewContainer } from '@marcellejs/design-system';
  import { Observable } from 'rxjs';

  export let title: string;
  export let loading: Observable<boolean>;
  export let version: MobileNetVersion;
  export let alpha: MobileNetAlpha;
</script>

<ViewContainer {title} loading={$loading}>
  <p class="p-2 text-sm text-gray-600">
    {#if $loading}&nbsp;{:else}Using Mobilenet v{version} with alpha = {alpha}.{/if}
  </p>
</ViewContainer>
