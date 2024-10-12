<script lang="ts">
  import { BehaviorSubject } from 'rxjs';
  import NumberArray from './NumberArray.svelte';

  export let value: BehaviorSubject<number[]>;
  export let disabled: BehaviorSubject<boolean>;
</script>

<div class="w-full max-w-sm">
  <div class="md:flex md:items-center mb-2">
    <NumberArray bind:value={$value} disabled={$disabled} />
  </div>
</div>
