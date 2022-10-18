<script>
  import { ViewContainer } from '@marcellejs/design-system';

  export let title;
  export let options;
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
