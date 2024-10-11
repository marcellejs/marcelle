<script lang="ts">
  import { BehaviorSubject } from 'rxjs';
  import Number from './Number.svelte';

  export let value: BehaviorSubject<number>;
  export let disabled: BehaviorSubject<boolean>;
</script>

<div class="w-full max-w-sm">
  <div class="md:flex md:items-center mb-2">
    <Number bind:value={$value} disabled={$disabled} />
  </div>
</div>
