<script lang="ts">
  import type { Stream } from '../../core/stream';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import ParamWrapper from './ParamWrapper.svelte';

  export let title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let parameters: Record<string, Stream<any>>;
  export let config: Record<string, { type: string; options?: string[] }> = {};

  let unSub: Array<() => void> = [];
  $: {
    for (const u of unSub) {
      u();
    }
    unSub = Object.values(parameters).map((s) => s.subscribe());
  }
</script>

<ViewContainer {title}>
  <div class="m-2">
    {#each Object.entries(parameters) as [key, stream]}
      <div class="flex my-1 items-center">
        <p class="w-32 my-2">{key}</p>
        {#if key in config}
          <ParamWrapper {stream} spec={config[key]} />
        {:else}
          <ParamWrapper {stream} spec={{ type: 'auto' }} />
        {/if}
      </div>
    {/each}
  </div>
</ViewContainer>
