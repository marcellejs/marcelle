<script lang="ts">
  import type { BehaviorSubject } from 'rxjs';

  export let options: BehaviorSubject<string[]>;
  export let value: BehaviorSubject<string>;
</script>

<select class="select select-bordered w-full max-w-xs" bind:value={$value}>
  {#each $options as option}
    <option>{option}</option>
  {/each}
</select>
