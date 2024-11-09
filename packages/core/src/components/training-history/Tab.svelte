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
  class="text-sm font-semibold text-gray-600 cursor-pointer mx-4 p-2 hover:text-gray-800"
  class:selected={$selectedTab === tab}
  role="tab"
  onclick={() => selectTab(tab)}
  tabindex="0"
>
  {@render children_render?.()}
</div>

<style>
  .selected {
    @apply border-solid border-0 border-b-2 border-green-400 text-black;
  }
</style>
