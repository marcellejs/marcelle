<script lang="ts">
  import type { Observable } from 'rxjs';

  interface Props {
    loading: Observable<boolean>;
    base: string;
  }

  let { loading, base }: Props = $props();
</script>

<p class="mtf:p-2 mtf:text-sm mtf:text-gray-600">
  {#if $loading}&nbsp;{:else}COCO-SSD loaded with base {base}{/if}
</p>
