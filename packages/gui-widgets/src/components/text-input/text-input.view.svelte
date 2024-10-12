<script lang="ts">
  import type { Subject } from 'rxjs';

  export let value: Subject<string>;
  export let disabled: Subject<boolean>;
</script>

<div class="w-full max-w-sm">
  <div class="mb-2 md:flex md:items-center">
    <input
      type="text"
      placeholder="Enter a label..."
      class="input input-bordered w-full max-w-sm"
      bind:value={$value}
      disabled={$disabled}
    />
  </div>
</div>
