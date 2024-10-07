<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let title: string;
  export let items: Record<string, string>;
  export let current: string;
  export let closable: boolean;
  export let showSettings = false;

  const dispatch = createEventDispatcher();

  function toggleSettings() {
    if (showSettings) {
      window.location.href =
        window.location.href.split('#')[0] +
        '#' +
        Object.keys(items)[Object.values(items).indexOf(current)];
    } else {
      window.location.href = window.location.href.split('#')[0] + '#settings';
    }
  }

  export function quit(): void {
    setTimeout(() => {
      dispatch('quit');
    }, 400);
  }
</script>

<div class="navbar bg-base-100">
  <div class="navbar-start">
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h8m-8 6h16"
          />
        </svg>
      </div>
      <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
      <ul
        tabindex="0"
        class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
      >
        {#each Object.entries(items) as [slug, name]}
          <li>
            <a href={`#${slug}`} class:active={!showSettings && current === name}>
              {name}
            </a>
          </li>
        {/each}
      </ul>
    </div>
    <a href="#/" class="btn btn-ghost text-xl">{title}</a>
    <!-- </div> -->
    <div class="hidden lg:flex">
      <ul class="menu menu-horizontal my-0 px-1 gap-1">
        {#each Object.entries(items) as [slug, name]}
          <li>
            <a href={`#${slug}`} class:active={!showSettings && current === name}>
              {name}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
  <div class="navbar-end">
    <button class="btn btn-ghost btn-circle" on:click={toggleSettings}>
      <div class="indicator">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
          />
        </svg>
      </div>
    </button>
    {#if closable}
      <button class="btn btn-ghost btn-circle text-error" on:click={quit}>
        <div class="indicator">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
      </button>
    {/if}
  </div>
</div>

<style lang="postcss">
  a {
    color: inherit;
    text-decoration: inherit;
  }

  .active {
    @apply text-gray-900 border-green-500;
  }
</style>
