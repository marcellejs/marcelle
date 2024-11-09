<script lang="ts">
  import { BehaviorSubject, Subject } from 'rxjs';

  interface Props {
    value: Subject<string>;
    placeholder: string;
    disabled: BehaviorSubject<boolean>;
  }

  let { value, placeholder, disabled }: Props = $props();
</script>

<div class="w-full">
  <textarea
    class="m-0 w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
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
