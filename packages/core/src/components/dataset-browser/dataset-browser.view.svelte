<script lang="ts">
  import type { ObjectId } from '../../core';
  import type { Dataset } from '../../core/dataset';
  import type { DBInstance } from './dataset-browser.component';
  import { onMount } from 'svelte';
  import { scale } from 'svelte/transition';
  import { ViewContainer } from '@marcellejs/design-system';
  import { Button, PopMenu } from '@marcellejs/design-system';
  import { BehaviorSubject } from 'rxjs';

  export let title: string;
  export let batchSize: number;
  export let count: BehaviorSubject<number>;
  export let dataset: Dataset<DBInstance>;
  export let selected: BehaviorSubject<ObjectId[]>;

  let loading = false;
  let dataStoreError = false;

  let classes: Record<
    string,
    {
      total: number;
      loaded: number;
      instances: Partial<DBInstance>[];
    }
  > = {};

  async function loadMore(label: string) {
    await dataset.ready;
    for await (const instance of dataset
      .items()
      .query({ y: label, $sort: { updatedAt: -1 } })
      .skip(classes[label].loaded)
      .take(batchSize)
      .select(['id', 'y', 'thumbnail'])) {
      classes[label].instances = [...classes[label].instances, instance];
      classes[label].loaded += 1;
    }
  }

  async function updateClassesFromDataset() {
    if (loading) return;
    loading = true;
    try {
      dataStoreError = false;
      await dataset.ready;
    } catch (e) {
      loading = false;
      dataStoreError = true;
      return;
    }
    const labels = await dataset.distinct('y');
    classes = labels.reduce(
      (x, lab) => ({
        ...x,
        [lab]: {
          total: 0,
          loaded: 0,
          instances: [],
        },
      }),
      {},
    );
    for (const label of labels) {
      const { total } = await dataset.find({ query: { $limit: 0, y: label } });
      classes[label].total = total;
      if (batchSize > 0) {
        await loadMore(label);
      } else {
        while (classes[label].loaded < classes[label].total) {
          await loadMore(label);
        }
      }
    }
    loading = false;
  }

  function getLabel(id: ObjectId) {
    for (const [label, { instances }] of Object.entries(classes)) {
      if (instances.map((x) => x.id).includes(id)) {
        return label;
      }
    }
    return null;
  }

  async function deleteSelectedInstances() {
    let p: Promise<unknown> = Promise.resolve();
    for (const id of selected.getValue()) {
      // eslint-disable-next-line no-loop-func
      p = p.then(() => dataset.remove(id));
    }
    await p;
    selected.next([]);
  }

  async function relabelSelectedInstances(newLabel: string) {
    let p: Promise<unknown> = Promise.resolve();
    for (const id of selected.getValue()) {
      // eslint-disable-next-line no-loop-func
      p = p.then(() => dataset.patch(id, { y: newLabel }));
    }
    await p;
    selected.next([]);
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
      if (selected.getValue().includes(id)) {
        selected.next(selected.getValue().filter((x) => x !== id));
      } else {
        selected.next(selected.getValue().concat([id]));
      }
    } else if (shiftPressed) {
      if (!initialId || !id) return;
      const srcLabel = getLabel(initialId);
      const dstLabel = getLabel(id);
      if (srcLabel !== dstLabel) return;
      const instances = classes[srcLabel].instances.map((x) => x.id);
      const srcIndex = instances.indexOf(initialId);
      const dstIndex = instances.indexOf(id);
      selected.next(
        srcIndex < dstIndex
          ? instances.slice(srcIndex, dstIndex + 1)
          : instances.slice(dstIndex, srcIndex + 1),
      );
    } else {
      selected.next(id ? [id] : []);
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
      for (const { level, type, data } of changes) {
        if (level === 'dataset') {
          if (type === 'created') {
            selectInstance();
            updateClassesFromDataset();
          }
        } else if (level === 'instance') {
          if (type === 'created') {
            if (!classes[data.y]) {
              classes[data.y] = {
                total: 0,
                loaded: 0,
                instances: [],
              };
            }
            classes[data.y].total += 1;
            classes[data.y].loaded += 1;
            classes[data.y].instances = [
              { id: data.id, y: data.y, thumbnail: data.thumbnail },
              ...classes[data.y].instances,
            ];
          } else if (type === 'updated') {
            // TODO: what if the image is not displayed?
            const originalLabel = getLabel(data.id);
            classes[originalLabel].total -= 1;
            classes[originalLabel].loaded -= 1;
            classes[originalLabel].instances = classes[originalLabel].instances.filter(
              ({ id }) => id !== data.id,
            );
            if (classes[originalLabel].total === 0) {
              delete classes[originalLabel];
              classes = classes;
            }
            if (!classes[data.y]) {
              classes[data.y] = {
                total: 0,
                loaded: 0,
                instances: [],
              };
            }
            classes[data.y].instances = [
              { id: data.id, y: data.y, thumbnail: data.thumbnail },
              ...classes[data.y].instances,
            ];
          } else if (type === 'removed') {
            classes[data.y].total -= 1;
            classes[data.y].loaded -= 1;
            classes[data.y].instances = classes[data.y].instances.filter(
              ({ id }) => id !== data.id,
            );
            if (classes[data.y].total === 0) {
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
  {#if classes && !dataStoreError}
    {#if $count > 0}
      <p class="ml-3 mt-2">This dataset contains {$count} instance{$count > 1 ? 's' : ''}.</p>
    {:else}
      <p class="ml-3 mt-2">This dataset is empty.</p>
    {/if}

    <div
      class="flex flex-wrap"
      on:click={() => selectInstance()}
      on:keypress|preventDefault={(e) => e.key === 'Escape' && selectInstance()}
    >
      {#each Object.entries(classes) as [label, { loaded, total, instances }]}
        <div class="browser-class">
          <div class="w-full">
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
              {#each instances as { id, thumbnail } (id)}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <img
                  src={thumbnail}
                  alt="thumbnail"
                  class="m-1"
                  class:selected={$selected.includes(id)}
                  in:scale
                  out:scale
                  on:click|stopPropagation={() => selectInstance(id)}
                />
              {/each}
            </div>
          </div>
          <div class="pb-1">
            {#if loaded < total}
              <Button size="small" variant="light" on:click={() => loadMore(label)}>
                View More
              </Button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
  {#if dataStoreError}
    <div
      class="flex p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
      role="alert"
    >
      <svg
        class="inline flex-shrink-0 mr-3 w-5 h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        /></svg
      >
      <div>
        <span class="font-medium">Data Store connection Error!</span> This data store probably requires
        authentication
      </div>
    </div>
  {/if}
</ViewContainer>

<style>
  .browser-class {
    @apply relative m-2 w-1/3 grow flex flex-col items-center justify-between;
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
    @apply border-solid border-2 border-transparent rounded-md;
  }

  .browser-class-body img.selected {
    @apply border-gray-600;
  }
</style>
