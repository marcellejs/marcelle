<svelte:options accessors />

<script lang="ts">
  import type { Observable } from 'rxjs';

  export let text: Observable<string>;
</script>

<div class="grow">
  {#if $text}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html $text}
  {/if}
</div>
