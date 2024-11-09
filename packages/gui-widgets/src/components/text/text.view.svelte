<svelte:options />

<script lang="ts">
  import type { Observable } from 'rxjs';

  interface Props {
    text: Observable<string>;
  }

  let { text }: Props = $props();

  export {
  	text,
  }
</script>

<div class="grow">
  {#if $text}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html $text}
  {/if}
</div>
