<script lang="ts">
  interface Props {
    options: Record<string, unknown>;
  }

  let { options }: Props = $props();
</script>

<div>This is a <span class="my-color">custom</span> component with the following options:</div>
<p>{JSON.stringify(options)}</p>

<style>
  .my-color {
    color: seagreen;
  }
</style>
