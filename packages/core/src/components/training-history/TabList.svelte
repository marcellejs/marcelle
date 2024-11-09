<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
  const children_render = $derived(children);

</script>

<div class="flex border-solid border-0 border-b border-gray-200 mb-2">
  {@render children_render?.()}
</div>
