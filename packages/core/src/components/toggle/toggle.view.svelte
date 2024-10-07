<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import { BehaviorSubject } from 'rxjs';

  export let title: string;
  export let text: BehaviorSubject<string>;
  export let checked: BehaviorSubject<boolean>;
  export let disabled: BehaviorSubject<boolean>;
</script>

<ViewContainer {title}>
  <div class="form-control">
    <label class="label cursor-pointer justify-start">
      <input type="checkbox" class="toggle" bind:checked={$checked} disabled={$disabled} />
      <span class="label-text ml-2">{$text}</span>
    </label>
  </div>
</ViewContainer>
