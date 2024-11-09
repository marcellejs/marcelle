<script lang="ts">
  import { getContext } from 'svelte';
  import { TABS } from './Tabs.svelte';
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();

  const panel = {};
  const { registerPanel, selectedPanel } = getContext(TABS);

  registerPanel(panel);
</script>

{#if $selectedPanel === panel}
  {@render children?.()}
{/if}
