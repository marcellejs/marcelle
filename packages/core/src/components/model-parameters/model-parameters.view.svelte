<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import ParamWrapper from './ParamWrapper.svelte';
  import { BehaviorSubject, Subscription } from 'rxjs';
  import { rxBind } from '../../utils/rxjs';

  export let title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let parameters: Record<string, BehaviorSubject<any>>;
  export let config: Record<string, { type: string; options?: string[] }> = {};

  let sub: Subscription[] = [];
  $: {
    for (const u of sub) {
      u.unsubscribe();
    }
    sub = Object.values(parameters).map((s) => s.subscribe());
  }
</script>

<ViewContainer {title}>
  <div class="m-2">
    {#each Object.entries(parameters) as [key, stream]}
      <div class="flex my-1 items-center">
        <p class="w-32 my-2">{key}</p>
        {#if key in config}
          <ParamWrapper stream={rxBind(stream)} spec={config[key]} />
        {:else}
          <ParamWrapper stream={rxBind(stream)} spec={{ type: 'auto' }} />
        {/if}
      </div>
    {/each}
  </div>
</ViewContainer>
