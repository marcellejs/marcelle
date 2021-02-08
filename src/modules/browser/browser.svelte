<script lang="ts">
  import { onMount } from 'svelte';

  import type { Instance, Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';
  import PopMenu from '../../ui/widgets/PopMenu.svelte';
  import type { Dataset } from '../dataset';

  export let title: string;
  export let count: Stream<number>;
  export let dataset: Dataset;

  let loading = false;

  let classes: Array<{
    label: string;
    instances: Instance[];
  }> = [];

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

  async function updateClassesFromDataset() {
    loading = true;
    classes = await Promise.all(
      Object.entries(dataset.$classes.value).map(async ([label, instanceIds]) => {
        return {
          label,
          instances: await Promise.all(
            instanceIds.map((id) =>
              dataset.instanceService.get(id, {
                query: { $select: ['thumbnail'] },
              }),
            ),
          ),
        };
      }),
    );
    loading = false;
  }

  onMount(() => {
    updateClassesFromDataset();
    dataset.$changes.subscribe(async (changes) => {
      changes.forEach(async ({ level, type, data }) => {
        if (level === 'dataset') {
          if (type === 'created') {
            updateClassesFromDataset();
          }
        } else if (level === 'class') {
          if (type === 'renamed') {
            const srcIdx = classes.map(({ label }) => label).indexOf(data.srcLabel);
            const dstIdx = classes.map(({ label }) => label).indexOf(data.label);
            if (dstIdx >= 0) {
              classes[dstIdx].instances = classes[dstIdx].instances.concat(
                classes[srcIdx].instances,
              );
              classes.splice(srcIdx, 1);
              classes = classes;
            } else {
              classes[srcIdx].label = data.label;
            }
          } else if (type === 'deleted') {
            const classIdx = classes.map(({ label }) => label).indexOf(data);
            if (classIdx >= 0) {
              classes.splice(classIdx, 1);
              classes = classes;
            }
          }
        } else {
          if (type === 'created') {
            const instance = await dataset.instanceService.get(data.id, {
              query: { $select: ['thumbnail'] },
            });
            const classIdx = classes.map(({ label }) => label).indexOf(data.label);
            if (classIdx >= 0) {
              classes[classIdx].instances = classes[classIdx].instances.concat([instance]);
            } else {
              classes = classes.concat([{ label: data.label, instances: [instance] }]);
            }
          }
        }
      });
    });
  });
</script>

<ModuleBase {title} {loading}>
  {#if classes}
    {#if $count > 0}
      <p class="ml-3 mt-2">This dataset contains {$count} instance{$count > 1 ? 's' : ''}.</p>
    {:else}
      <p class="ml-3 mt-2">This dataset is empty.</p>
    {/if}

    <div class="flex flex-wrap">
      {#each classes as { label, instances }}
        <div class="browser-class">
          <div class="browser-class-header">
            <span class="browser-class-title">{label}</span>
            <PopMenu
              actions={[
                { code: 'edit', text: 'Edit Label' },
                { code: 'delete', text: 'Delete Class' },
              ]}
              on:select={(e) => onClassAction(label, e.detail)}
            />
          </div>
          <div class="browser-class-body">
            {#each instances as { id, thumbnail }}
              <img src={thumbnail} alt="thumbnail" class="p-1" />
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</ModuleBase>

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
