<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';

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
