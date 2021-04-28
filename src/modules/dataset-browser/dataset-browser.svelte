<script lang="ts">
  import { onMount } from 'svelte';

  import type { Instance, ObjectId, Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';
  import PopMenu from '../../ui/widgets/PopMenu.svelte';
  import type { Dataset } from '../../dataset';

  export let title: string;
  export let count: Stream<number>;
  export let dataset: Dataset;
  export let selected: Stream<ObjectId[]>;

  let loading = false;

  let classes: Array<{
    label: string;
    instances: Instance[];
  }> = [];

  async function updateClassesFromDataset() {
    loading = true;
    classes = [];
    for (const label of Object.keys(dataset.$classes.value)) {
      const instances = await dataset
        .items()
        .query({ label })
        .select(['id', 'thumbnail'])
        .toArray();
      classes = classes.concat([{ label, instances }]);
    }
    loading = false;
  }

  function getLabel(id: ObjectId) {
    for (let i = 0; i < classes.length; i++) {
      if (classes[i].instances.map((x) => x.id).includes(id)) {
        return classes[i].label;
      }
    }
    return null;
  }

  async function deleteSelectedInstances() {
    let p: Promise<unknown> = Promise.resolve();
    for (const id of selected.value) {
      // eslint-disable-next-line no-loop-func
      p = p.then(() => dataset.remove(id));
    }
    await p;
    selected.set([]);
  }

  async function relabelSelectedInstances(newLabel: string) {
    let p: Promise<unknown> = Promise.resolve();
    for (const id of selected.value) {
      // eslint-disable-next-line no-loop-func
      p = p.then(() => dataset.patch(id, { label: newLabel }));
    }
    await p;
    selected.set([]);
  }

  let metaPressed = false;
  let shiftPressed = false;
  function handleKeydown(event: KeyboardEvent) {
    if (['Meta', 'Control'].includes(event.key)) {
      metaPressed = true;
    } else if (event.key === 'Shift') {
      shiftPressed = true;
    } else if (event.key === 'Delete' || (event.key === 'Backspace' && metaPressed)) {
      deleteSelectedInstances();
    }
  }
  function handleKeyup(event: KeyboardEvent) {
    if (['Meta', 'Control'].includes(event.key)) {
      metaPressed = false;
    } else if (event.key === 'Shift') {
      shiftPressed = false;
    }
  }

  let initialId: ObjectId = null;
  function selectInstance(id?: ObjectId) {
    if (metaPressed) {
      if (!id) return;
      if (selected.value.includes(id)) {
        selected.set(selected.value.filter((x) => x !== id));
      } else {
        selected.set(selected.value.concat([id]));
      }
    } else if (shiftPressed) {
      if (!initialId || !id) return;
      const srcLabel = getLabel(initialId);
      const dstLabel = getLabel(id);
      if (srcLabel !== dstLabel) return;
      const instances = classes
        .filter(({ label }) => label === srcLabel)[0]
        .instances.map((x) => x.id);
      const srcIndex = instances.indexOf(initialId);
      const dstIndex = instances.indexOf(id);
      selected.set(
        srcIndex < dstIndex
          ? instances.slice(srcIndex, dstIndex + 1)
          : instances.slice(dstIndex, srcIndex + 1),
      );
    } else {
      selected.set(id ? [id] : []);
      initialId = id;
    }
  }

  function onClassAction(label: string, code: string) {
    let result: string;
    switch (code) {
      case 'edit':
        // eslint-disable-next-line no-alert
        result = window.prompt('Enter the new label', label);
        if (result) {
          dataset.renameClass(label, result);
        }
        break;

      case 'delete':
        dataset.deleteClass(label);
        break;

      case 'deleteInstances':
        deleteSelectedInstances();
        break;

      case 'relabelInstances':
        // eslint-disable-next-line no-alert
        result = window.prompt('Enter the new label', label);
        if (result) {
          relabelSelectedInstances(result);
        }
        break;

      default:
        // eslint-disable-next-line no-alert
        alert(`Class ${label}: ${code}`);
        break;
    }
  }

  onMount(() => {
    updateClassesFromDataset();
    dataset.$changes.subscribe(async (changes) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const { level, type, data } of changes as any[]) {
        if (level === 'dataset') {
          if (type === 'created') {
            updateClassesFromDataset();
          }
        } else if (level === 'instance') {
          if (type === 'created') {
            const classIdx = classes.map(({ label }) => label).indexOf(data.label);
            if (classIdx >= 0) {
              classes[classIdx].instances = classes[classIdx].instances.concat([data]);
            } else {
              classes = classes.concat([{ label: data.label, instances: [data] }]);
            }
          } else if (type === 'removed') {
            const classIdx = classes.map(({ label }) => label).indexOf(getLabel(data));
            if (classIdx >= 0) {
              classes[classIdx].instances = classes[classIdx].instances.filter(
                ({ id }) => id !== data,
              );
            }
          } else if (type === 'renamed') {
            const prevClassIdx = classes.map(({ label }) => label).indexOf(getLabel(data.id));
            if (prevClassIdx >= 0) {
              classes[prevClassIdx].instances = classes[prevClassIdx].instances.filter(
                ({ id }) => id !== data.id,
              );
            }
            const newClassIdx = classes.map(({ label }) => label).indexOf(data.label);
            if (newClassIdx >= 0) {
              classes[newClassIdx].instances = classes[newClassIdx].instances.concat([data]);
            } else {
              classes = classes.concat([{ label: data.label, instances: [data] }]);
            }
          }
        }
        classes = classes.filter((x) => x.instances.length > 0);
      }
    });
  });
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<ModuleBase {title} {loading}>
  {#if classes}
    {#if $count > 0}
      <p class="ml-3 mt-2">This dataset contains {$count} instance{$count > 1 ? 's' : ''}.</p>
    {:else}
      <p class="ml-3 mt-2">This dataset is empty.</p>
    {/if}

    <div class="flex flex-wrap" on:click={() => selectInstance()}>
      {#each classes as { label, instances }}
        <div class="browser-class">
          <div class="browser-class-header">
            <span class="browser-class-title">{label}</span>
            <PopMenu
              actions={[
                { code: 'edit', text: 'Edit class label' },
                { code: 'delete', text: 'Delete class' },
              ].concat(
                $selected.length > 0
                  ? [
                      {
                        code: 'deleteInstances',
                        text: `Delete selected instance${$selected.length > 1 ? 's' : ''}`,
                      },
                      {
                        code: 'relabelInstances',
                        text: `Relabel selected instance${$selected.length > 1 ? 's' : ''}`,
                      },
                    ]
                  : [],
              )}
              on:select={(e) => onClassAction(label, e.detail)}
            />
          </div>
          <div class="browser-class-body">
            {#each instances as { id, thumbnail }}
              <img
                src={thumbnail}
                alt="thumbnail"
                class="m-1"
                class:selected={$selected.includes(id)}
                on:click|stopPropagation={() => selectInstance(id)}
              />
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
    box-sizing: content-box;
    @apply border-2 border-transparent rounded-md;
  }

  .browser-class-body img.selected {
    @apply border-teal-700;
  }
</style>
