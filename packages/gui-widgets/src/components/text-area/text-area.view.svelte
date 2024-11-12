<script lang="ts">
  import { BehaviorSubject, Subject } from 'rxjs';

  interface Props {
    value: Subject<string>;
    placeholder: string;
    disabled: BehaviorSubject<boolean>;
  }

  let { value, placeholder, disabled }: Props = $props();
</script>

<div class="mgui-w-full">
  <textarea
    class="mgui-m-0 mgui-w-full mgui-rounded mgui-border mgui-border-solid mgui-border-gray-300 mgui-bg-white mgui-bg-clip-padding mgui-px-3 mgui-py-1.5 mgui-text-base mgui-font-normal mgui-text-gray-700 mgui-transition mgui-ease-in-out focus:mgui-border-blue-600 focus:mgui-bg-white focus:mgui-text-gray-700 focus:mgui-outline-none"
    {placeholder}
    bind:value={$value}
    disabled={$disabled}
  ></textarea>
</div>

<style>
  textarea {
    font-family: inherit;
    padding: 0.5rem;
  }
</style>
