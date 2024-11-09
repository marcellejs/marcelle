<script lang="ts">
  import { BehaviorSubject } from 'rxjs';

  interface Props {
    text: BehaviorSubject<string>;
    checked: BehaviorSubject<boolean>;
    disabled: BehaviorSubject<boolean>;
  }

  let { text, checked, disabled }: Props = $props();
</script>

<div class="mgui-form-control">
  <label class="mgui-label cursor-pointer justify-start">
    <input type="checkbox" class="mgui-toggle" bind:checked={$checked} disabled={$disabled} />
    <span class="mgui-label-text ml-2">{$text}</span>
  </label>
</div>
