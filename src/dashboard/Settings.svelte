<script>
  export let settings;
  $: console.log('settings', settings);
</script>

<style type="text/postcss">
  .left {
    @apply flex-shrink-0 p-1;
    width: 350px;
  }

  .right {
    @apply flex-grow p-1;
  }
</style>

<div class="left" />
<div class="right">{JSON.stringify(settings)}</div>
