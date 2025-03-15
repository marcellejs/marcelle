<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
  const children_render = $derived(children);
</script>

<div class="mcl:mb-2 mcl:flex mcl:border-0 mcl:border-b mcl:border-solid mcl:border-gray-200">
  {@render children_render?.()}
</div>
