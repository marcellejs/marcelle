<svelte:options accessors />

<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import type { Observable } from 'rxjs';

  export let title: string;
  export let text: Observable<string>;
</script>

<ViewContainer {title}>
  <div class="grow">
    {#if $text}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html $text}
    {/if}
  </div>
</ViewContainer>
