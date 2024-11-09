<script lang="ts">
  import type { BehaviorSubject } from 'rxjs';

  interface Props {
    options: BehaviorSubject<string[]>;
    value: BehaviorSubject<string>;
  }

  let { options, value }: Props = $props();
</script>

<select class="mgui-select mgui-select-bordered w-full max-w-xs" bind:value={$value}>
  {#each $options as option}
    <option>{option}</option>
  {/each}
</select>
