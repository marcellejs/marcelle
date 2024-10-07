<script lang="ts">
  import { BehaviorSubject } from 'rxjs';

  export let options: BehaviorSubject<string[]>;
  export let value: BehaviorSubject<string>;

  // function updateStream({ detail }: CustomEvent) {
  //   value.next(detail);
  // }
</script>

<select class="select select-bordered w-full max-w-xs" bind:value={$value}>
  {#each $options as option}
    <option>{option}</option>
  {/each}
</select>
