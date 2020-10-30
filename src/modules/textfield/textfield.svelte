<script>
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title;
  export let text;
</script>

<ModuleBase {title}>
  <div class="w-full max-w-sm">
    <div class="md:flex md:items-center mb-2">
      <input
        class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4
        text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
        id="inline-label"
        type="text"
        placeholder="Enter a label.."
        bind:value={$text} />
    </div>
  </div>
</ModuleBase>
