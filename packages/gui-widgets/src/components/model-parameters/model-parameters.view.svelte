<script lang="ts">
  import ParamWrapper from './ParamWrapper.svelte';
  import { rxBind } from '@marcellejs/core';
  import { BehaviorSubject } from 'rxjs';

  interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters: Record<string, BehaviorSubject<any>>;
    config?: Record<string, { type: string; options?: string[] }>;
  }

  let { parameters, config = {} }: Props = $props();
</script>

<div class="m-2">
  {#each Object.entries(parameters) as [key, stream]}
    <div class="my-1 flex items-center">
      <p class="my-2 w-32">{key}</p>
      {#if key in config}
        <ParamWrapper stream={rxBind(stream)} spec={config[key]} />
      {:else}
        <ParamWrapper stream={rxBind(stream)} spec={{ type: 'auto' }} />
      {/if}
    </div>
  {/each}
</div>
