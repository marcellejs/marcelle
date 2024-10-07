<script lang="ts">
  import type { MobileNetAlpha, MobileNetVersion } from '@tensorflow-models/mobilenet';
  import { Observable } from 'rxjs';

  export let loading: Observable<boolean>;
  export let version: MobileNetVersion;
  export let alpha: MobileNetAlpha;
</script>

<p class="p-2 text-sm text-gray-600">
  {#if $loading}&nbsp;{:else}Using Mobilenet v{version} with alpha = {alpha}.{/if}
</p>
