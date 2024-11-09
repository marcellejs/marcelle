<script lang="ts">
  import { BehaviorSubject } from 'rxjs';
  import Number from './Number.svelte';

  interface Props {
    value: BehaviorSubject<number>;
    disabled: BehaviorSubject<boolean>;
  }

  let { value, disabled }: Props = $props();
</script>

<div class="w-full max-w-sm">
  <div class="md:flex md:items-center mb-2">
    <Number bind:value={$value} disabled={$disabled} />
  </div>
</div>
