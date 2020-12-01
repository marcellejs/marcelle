<script lang="ts">
  import type { Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';
  import PopMenu from '../../ui/widgets/PopMenu.svelte';
  import type { Dataset } from '../dataset';

  export let title: string;
  export let count: Stream<number>;
  export let classes: Stream<Record<string, string[]>>;
  export let dataset: Dataset;

  function onClassAction(label: string, code: string) {
    switch (code) {
      case 'edit':
        const result = window.prompt('Enter the new label', label);
        if (result) {
          dataset.renameClass(label, result);
        }
        break;

      case 'delete':
        dataset.deleteClass(label);
        break;

      default:
        alert(`Class ${label}: ${code}`);
        break;
    }
  }
</script>

<style>
  .browser-class {
    @apply relative m-2 w-1/3 flex-grow;
    @apply border-gray-600 border rounded-lg;
    min-width: 300px;
  }

  .browser-class-header {
    @apply flex flex-row justify-between w-full;
  }

  .browser-class-title {
    @apply text-sm px-2 py-1 bg-gray-600 text-white rounded-br-md rounded-tl-md;
  }

  .browser-class-body {
    @apply flex flex-wrap justify-center;
    @apply p-1;
  }

  .browser-class-body img {
    width: 60px;
    @apply border-gray-200 rounded-md;
  }
</style>

<ModuleBase {title}>
  {#if $classes}
    {#if $count > 0}
      <p class="ml-3 mt-2">This dataset contains {$count} instance{$count > 1 ? 's' : ''}.</p>
    {:else}
      <p class="ml-3 mt-2">This dataset is empty.</p>
    {/if}

    <div class="flex flex-wrap">
      {#each Object.entries($classes) as [key, classInstances]}
        <div class="browser-class">
          <div class="browser-class-header">
            <span class="browser-class-title">{key}</span>
            <PopMenu
              actions={[{ code: 'edit', text: 'Edit Label' }, { code: 'delete', text: 'Delete Class' }]}
              on:select={(e) => onClassAction(key, e.detail)} />
          </div>
          <div class="browser-class-body">
            {#each classInstances as id}
              {#await dataset.instanceService.get(id, {
                query: { $select: ['thumbnail'] },
              }) then instance}
                <img src={instance.thumbnail} alt="thumbnail" class="p-1" />
              {/await}
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</ModuleBase>
