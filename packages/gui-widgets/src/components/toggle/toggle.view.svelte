<script lang="ts">
  import { BehaviorSubject } from 'rxjs';

  export let text: BehaviorSubject<string>;
  export let checked: BehaviorSubject<boolean>;
  export let disabled: BehaviorSubject<boolean>;
</script>

<div class="mgui-form-control">
  <label class="mgui-label cursor-pointer justify-start">
    <input type="checkbox" class="mgui-toggle" bind:checked={$checked} disabled={$disabled} />
    <span class="mgui-label-text ml-2">{$text}</span>
  </label>
</div>
