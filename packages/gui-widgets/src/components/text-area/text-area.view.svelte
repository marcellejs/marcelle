<script lang="ts">
  import { Subject } from 'rxjs';

  interface Props {
    value: Subject<string>;
    placeholder: string;
    disabled: any;
  }

  let { value, placeholder, disabled }: Props = $props();
</script>

<div class="w-full">
  <textarea
    class="w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
    {placeholder}
    bind:value={$value}
    disabled={$disabled}
></textarea>
</div>

<style>
  .w-full {
    width: 100%;
  }

  textarea {
    font-family: inherit;
    padding: 0.5rem;
  }
</style>
