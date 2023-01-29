<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import type { HuggingfaceModelOptions } from './huggingface-model.component';

  export let title: string;
  export let options: HuggingfaceModelOptions;
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
