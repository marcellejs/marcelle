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

<div class="mgui-m-2">
  {#each Object.entries(parameters) as [key, stream]}
    <div class="mgui-my-1 mgui-flex mgui-items-center">
      <p class="mgui-my-2 mgui-w-32">{key}</p>
      {#if key in config}
        <ParamWrapper stream={rxBind(stream)} spec={config[key]} />
      {:else}
        <ParamWrapper stream={rxBind(stream)} spec={{ type: 'auto' }} />
      {/if}
    </div>
  {/each}
</div>
