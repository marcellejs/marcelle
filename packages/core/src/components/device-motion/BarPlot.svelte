<script lang="ts">
  export let values: number[];
</script>

<div class="w-full">
  {#if values && Array.isArray(values)}
    <div class="w-full">
      <div
        class="h-4 bg-blue-400"
        style="width: {(50 * Math.abs(values[0])) / 10}%; margin-left: {values[0] > 0
          ? '50%'
          : `${50 * (1 - Math.abs(values[0]) / 10)}%`}"
      />
    </div>
    <div class="w-full">
      <div
        class="h-4 bg-red-400"
        style="width: {(50 * Math.abs(values[1])) / 10}%; margin-left: {values[1] > 0
          ? '50%'
          : `${50 * (1 - Math.abs(values[1]) / 10)}%`}"
      />
    </div>
    <div class="w-full">
      <div
        class="h-4 bg-green-400"
        style="width: {(50 * Math.abs(values[2])) / 10}%; margin-left: {values[2] > 0
          ? '50%'
          : `${50 * (1 - Math.abs(values[2]) / 10)}%`}"
      />
    </div>
  {/if}
</div>

<style>
</style>
