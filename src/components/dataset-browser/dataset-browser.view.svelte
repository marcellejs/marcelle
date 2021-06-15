<script lang="ts">
  import { onMount } from 'svelte';

  import type { Instance, ObjectId, Stream } from '../../core';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import PopMenu from '../../ui/components/PopMenu.svelte';
  import type { Dataset } from '../../core/dataset';

  export let title: string;
  export let count: Stream<number>;
  export let dataset: Dataset<unknown, string>;
  export let selected: Stream<ObjectId[]>;

  let loading = false;

  let classes: Record<string, Partial<Instance<unknown, string>>[]> = {};

  async function updateClassesFromDataset() {
    if (loading) return;
    loading = true;
    classes = {};
    await dataset.ready;
    for await (const instance of dataset.items().select(['id', 'y', 'thumbnail'])) {
      classes[instance.y] = (classes[instance.y] || []).concat([instance]);
    }
    loading = false;
  }

  function getLabel(id: ObjectId) {
    for (const [label, instances] of Object.entries(classes)) {
      if (instances.map((x) => x.id).includes(id)) {
        return label;
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
      p = p.then(() => dataset.patch(id, { y: newLabel }));
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
      const instances = classes[srcLabel].map((x) => x.id);
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
          dataset.patch(null, { y: result }, { query: { y: label } });
        }
        break;

      case 'delete':
        dataset.remove(null, { query: { y: label } });
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
            classes[data.y] = (classes[data.y] || []).concat([
              { id: data.id, y: data.y, thumbnail: data.thumbnail },
            ]);
          } else if (type === 'updated') {
            const originalLabel = getLabel(data.id);
            classes[originalLabel] = classes[originalLabel].filter(({ id }) => id !== data.id);
            if (classes[originalLabel].length === 0) {
              delete classes[originalLabel];
              classes = classes;
            }
            classes[data.y] = (classes[data.y] || []).concat([
              { id: data.id, y: data.y, thumbnail: data.thumbnail },
            ]);
          } else if (type === 'removed') {
            classes[data.y] = classes[data.y].filter(({ id }) => id !== data.id);
            if (classes[data.y].length === 0) {
              delete classes[data.y];
              classes = classes;
            }
          }
        }
      }
    });
  });

</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<ViewContainer {title} {loading}>
  {#if classes}
    {#if $count > 0}
      <p class="ml-3 mt-2">This dataset contains {$count} instance{$count > 1 ? 's' : ''}.</p>
    {:else}
      <p class="ml-3 mt-2">This dataset is empty.</p>
    {/if}

    <div class="flex flex-wrap" on:click={() => selectInstance()}>
      {#each Object.entries(classes) as [label, instances]}
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
</ViewContainer>

<style>
  .browser-class {
    @apply relative m-2 w-1/3 flex-grow;
    @apply border-gray-500 border border-solid rounded-lg;
    min-width: 300px;
  }

  .browser-class-header {
    @apply flex flex-row justify-between items-center w-full;
  }

  .browser-class-title {
    @apply text-sm px-2 py-1 self-start font-semibold bg-gray-500 text-white rounded-tl-md rounded-br-md;
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
