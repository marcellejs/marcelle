<script lang="ts">
  import type { ObjectId } from '../../core';
  import type { Dataset } from '../../core/dataset';
  import type { DBInstance } from './dataset-browser.component';
  import { onMount } from 'svelte';
  import { scale } from 'svelte/transition';
  import { BehaviorSubject } from 'rxjs';

  interface Props {
    batchSize: number;
    count: BehaviorSubject<number>;
    dataset: Dataset<DBInstance>;
    selected: BehaviorSubject<ObjectId[]>;
  }

  let { batchSize, count, dataset, selected }: Props = $props();

  let loading = false;
  let dataStoreError = $state(false);

  let classes: Record<
    string,
    {
      total: number;
      loaded: number;
      instances: Array<Partial<DBInstance>>;
    }
  > = $state({});

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      p = p.then(() => dataset.remove(id));
    }
    await p;
    selected.next([]);
  }

  async function relabelSelectedInstances() {
    const newLabel = window.prompt('Enter the new label');
    if (!newLabel) return;
    let p: Promise<unknown> = Promise.resolve();
    for (const id of selected.getValue()) {
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

  function editClassLabel(label: string) {
    const result = window.prompt('Enter the new label', label);
    if (result) {
      dataset.patch(null, { y: result }, { query: { y: label } });
    }
  }

  function deleteClass(label: string) {
    dataset.remove(null, { query: { y: label } });
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

  function handleKeyPress(e: KeyboardEvent) {
    e.preventDefault();
    if (e.key === 'Escape') {
      selectInstance();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyup} />

{#if classes && !dataStoreError}
  {#if $count > 0}
    <p class="ml-3 mt-2">This dataset contains {$count} instance{$count > 1 ? 's' : ''}.</p>
  {:else}
    <p class="ml-3 mt-2">This dataset is empty.</p>
  {/if}

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="mcl:flex mcl:flex-wrap" onclick={() => selectInstance()} onkeypress={handleKeyPress}>
    {#each Object.entries(classes) as [label, { loaded, total, instances }], i (i)}
      <div class="browser-class">
        <div class="mcl:w-full">
          <div class="browser-class-header">
            <span class="browser-class-title">{label}</span>
            <div class="mcl:dropdown mcl:dropdown-end">
              <button
                tabindex="0"
                class="mcl:btn mcl:btn-circle mcl:btn-ghost mcl:btn-sm"
                aria-label="class actions"
              >
                <svg
                  class="inline-block h-5 w-5 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  ><path
                    d="M10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0-6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                  /></svg
                >
              </button>
              <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
              <ul
                tabindex="0"
                class="mcl:menu mcl:dropdown-content mcl:z-1 mcl:w-52 mcl:rounded-box mcl:bg-base-100 mcl:p-2 mcl:shadow"
              >
                <li>
                  <button onclick={() => editClassLabel(label)}> Edit Class Label </button>
                </li>
                <li><button onclick={() => deleteClass(label)}> Delete class </button></li>
                {#if $selected.length > 0}
                  <li>
                    <button onclick={deleteSelectedInstances}>
                      Delete selected instance{$selected.length > 1 ? 's' : ''}
                    </button>
                  </li>
                  <li>
                    <button onclick={relabelSelectedInstances}>
                      Relabel selected instance{$selected.length > 1 ? 's' : ''}
                    </button>
                  </li>
                {/if}
              </ul>
            </div>
          </div>

          <div class="browser-class-body">
            {#each instances as { id, thumbnail } (id)}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
              <img
                src={thumbnail}
                alt="thumbnail"
                class="mcl:m-1"
                class:selected={$selected.includes(id)}
                in:scale
                out:scale
                onclick={(e) => {
                  e.stopPropagation();
                  selectInstance(id);
                }}
              />
            {/each}
          </div>
        </div>
        <div class="pb-1">
          {#if loaded < total}
            <button class="mcl:btn mcl:btn-sm" onclick={() => loadMore(label)}> View More </button>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
{#if dataStoreError}
  <div
    class="mcl:dark:bg-red-200 mcl:dark:text-red-800 mcl:mb-4 mcl:flex mcl:rounded-lg mcl:bg-red-100 mcl:p-4 mcl:text-sm mcl:text-red-700"
    role="alert"
  >
    <svg
      class="mcl:mr-3 mcl:inline mcl:h-5 mcl:w-5 mcl:shrink-0"
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
      <span class="mcl:font-medium">Data Store connection Error!</span> This data store probably requires
      authentication
    </div>
  </div>
{/if}

<style lang="postcss">
  @reference "../../styles.css";

  .browser-class {
    @apply mcl:relative mcl:m-2 mcl:flex mcl:w-1/3 mcl:grow mcl:flex-col mcl:items-center mcl:justify-between;
    @apply mcl:rounded-lg mcl:border mcl:border-solid mcl:border-gray-500;
    min-width: 300px;
  }

  .browser-class-header {
    @apply mcl:flex mcl:w-full mcl:flex-row mcl:items-center mcl:justify-between;
  }

  .browser-class-title {
    @apply mcl:self-start mcl:rounded-br-md mcl:rounded-tl-md mcl:bg-gray-500 mcl:px-2 mcl:py-1 mcl:text-sm mcl:font-semibold mcl:text-white;
  }

  .browser-class-body {
    @apply mcl:flex mcl:flex-wrap mcl:justify-center;
    @apply mcl:p-1;
  }

  .browser-class-body img {
    width: 60px;
    box-sizing: content-box;
    @apply mcl:rounded-md mcl:border-2 mcl:border-solid mcl:border-transparent;
  }

  .browser-class-body img.selected {
    @apply mcl:border-gray-600;
  }
</style>
