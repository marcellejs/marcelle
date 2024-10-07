<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import { BehaviorSubject } from 'rxjs';
  import NumberArray from './NumberArray.svelte';

  export let title: string;
  export let value: BehaviorSubject<number[]>;
  export let disabled: BehaviorSubject<boolean>;
</script>

<ViewContainer {title}>
  <div class="w-full max-w-sm">
    <div class="md:flex md:items-center mb-2">
      <NumberArray bind:value={$value} disabled={$disabled} />
    </div>
  </div>
</ViewContainer>
