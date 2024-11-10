<script lang="ts">
  import { BehaviorSubject } from 'rxjs';
  import Number from './Number.svelte';

  interface Props {
    value: BehaviorSubject<number>;
    disabled: BehaviorSubject<boolean>;
  }

  let { value, disabled }: Props = $props();
</script>

<div class="mgui-w-full mgui-max-w-sm">
  <div class="md:mgui-flex md:mgui-items-center mgui-mb-2">
    <Number bind:value={$value} disabled={$disabled} />
  </div>
</div>
