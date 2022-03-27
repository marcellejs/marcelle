<script lang="ts">
  import { ViewContainer } from '<% if (!isMarcelleCore) { %>@marcellejs/core/svelte<% } else { %>../../core<% } %>';

  export let title: string;
  export let options: Record<string, unknown>;
</script>

<ViewContainer {title}>
  <div>This is a <span class="my-color">custom</span> component with the following options:</div>
  <p>{JSON.stringify(options)}</p>
</ViewContainer>

<style>
  .my-color {
    color: seagreen;
  }
</style>
