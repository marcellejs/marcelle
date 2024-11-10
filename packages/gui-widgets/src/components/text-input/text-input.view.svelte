<script lang="ts">
  import type { Subject } from 'rxjs';

  interface Props {
    value: Subject<string>;
    disabled: Subject<boolean>;
  }

  let { value, disabled }: Props = $props();
</script>

<div class="mgui-w-full mgui-max-w-sm">
  <div class="mgui-mb-2 md:mgui-flex md:mgui-items-center">
    <input
      type="text"
      placeholder="Enter a label..."
      class="mgui-input mgui-input-bordered mgui-w-full mgui-max-w-sm"
      bind:value={$value}
      disabled={$disabled}
    />
  </div>
</div>
