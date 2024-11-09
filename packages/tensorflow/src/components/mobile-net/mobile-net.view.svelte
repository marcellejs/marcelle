<script lang="ts">
  import type { MobileNetAlpha, MobileNetVersion } from '@tensorflow-models/mobilenet';
  import { Observable } from 'rxjs';

  interface Props {
    loading: Observable<boolean>;
    version: MobileNetVersion;
    alpha: MobileNetAlpha;
  }

  let { loading, version, alpha }: Props = $props();
</script>

<p class="p-2 text-sm text-gray-600">
  {#if $loading}&nbsp;{:else}Using Mobilenet v{version} with alpha = {alpha}.{/if}
</p>
