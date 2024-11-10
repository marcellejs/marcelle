<script lang="ts">
  import { getContext } from 'svelte';
  import { TABS } from './Tabs.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  const tab = {};
  const { registerTab, selectTab, selectedTab } = getContext(TABS);

  registerTab(tab);

  const children_render = $derived(children);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="mcl-hover:text-gray-800 mcl-mx-4 mcl-cursor-pointer mcl-p-2 mcl-text-sm mcl-font-semibold mcl-text-gray-600"
  class:selected={$selectedTab === tab}
  role="tab"
  onclick={() => selectTab(tab)}
  tabindex="0"
>
  {@render children_render?.()}
</div>

<style>
  .selected {
    @apply mcl-border-0 mcl-border-b-2 mcl-border-solid mcl-border-green-400 mcl-text-black;
  }
</style>
