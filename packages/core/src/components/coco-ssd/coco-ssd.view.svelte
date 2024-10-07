<script lang="ts">
  import type { Observable } from 'rxjs';

  export let loading: Observable<boolean>;
  export let base: string;
</script>

<p class="p-2 text-sm text-gray-600">
  {#if $loading}&nbsp;{:else}COCO-SSD loaded with base {base}{/if}
</p>
