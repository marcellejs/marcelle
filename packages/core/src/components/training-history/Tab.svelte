<script>
  import { getContext } from 'svelte';
  import { TABS } from './Tabs.svelte';

  const tab = {};
  const { registerTab, selectTab, selectedTab } = getContext(TABS);

  registerTab(tab);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="text-sm font-semibold text-gray-600 cursor-pointer mx-4 p-2 hover:text-gray-800"
  class:selected={$selectedTab === tab}
  role="tab"
  on:click={() => selectTab(tab)}
  tabindex="0"
>
  <slot />
</div>

<style>
  .selected {
    @apply border-solid border-0 border-b-2 border-green-400 text-black;
  }
</style>
