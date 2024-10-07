<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import { Subject } from 'rxjs';

  export let title: string;
  export let value: Subject<string>;
  export let disabled: Subject<boolean>;
</script>

<ViewContainer {title}>
  <div class="w-full max-w-sm">
    <div class="md:flex md:items-center mb-2">
      <input
        type="text"
        placeholder="Enter a label..."
        class="input input-bordered w-full max-w-sm"
        bind:value={$value}
        disabled={$disabled}
      />
    </div>
  </div>
</ViewContainer>
