<script lang="ts">
  export let options: Record<string, unknown>;
</script>

<div>This is a <span class="my-color">custom</span> component with the following options:</div>
<p>{JSON.stringify(options)}</p>

<style>
  .my-color {
    color: seagreen;
  }
</style>
