<script lang="ts">
  import type { Subject } from 'rxjs';

  interface Props {
    value: Subject<string>;
    disabled: Subject<boolean>;
  }

  let { value, disabled }: Props = $props();
</script>

<div class="w-full max-w-sm">
  <div class="mb-2 md:flex md:items-center">
    <input
      type="text"
      placeholder="Enter a label..."
      class="mgui-input mgui-input-bordered w-full max-w-sm"
      bind:value={$value}
      disabled={$disabled}
    />
  </div>
</div>
