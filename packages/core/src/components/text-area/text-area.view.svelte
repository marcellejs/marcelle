<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import { Subject } from 'rxjs';

  export let title: string;
  export let value: Subject<string>;
  export let placeholder: string;
  export let disabled;
</script>

<ViewContainer {title}>
  <div class="w-full">
    <textarea
      class="w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
      {placeholder}
      bind:value={$value}
      disabled={$disabled}
    />
  </div>
</ViewContainer>

<style>
  .w-full {
    width: 100%;
  }

  textarea {
    font-family: inherit;
    padding: 0.5rem;
  }
</style>
