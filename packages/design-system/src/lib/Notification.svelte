<script lang="ts">
  import { blur } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'default' | 'danger';
  }

  export let notifications: Notification[] = [];

  function close(id: number) {
    notifications = notifications.filter((x) => x.id !== id);
  }

  let uid = 1;
  export function add({
    title,
    message,
    type = 'default',
    duration = 3000,
  }: {
    title: string;
    message: string;
    type: 'default' | 'danger';
    duration: number;
  }): void {
    const n = {
      id: uid,
      title,
      message,
      type,
    };
    uid += 1;
    notifications = [...notifications, n];
    if (duration > 0) {
      setTimeout(() => {
        close(n.id);
      }, duration);
    }
  }
</script>

<div class="marcelle notification-container">
  {#each notifications.slice(0, 10) as { title, message, type, id } (id)}
    <div
      transition:blur={{ amount: 10 }}
      animate:flip
      class="notification-card"
      role="alert"
      class:default={type === 'default'}
      class:danger={type === 'danger'}
    >
      <div class="flex items-start">
        <div class="py-1">
          <svg
            class="notification-svg mr-4"
            class:default={type === 'default'}
            class:danger={type === 'danger'}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            {#if type === 'default'}
              <path
                d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0
                4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"
              />
            {:else if type === 'danger'}
              <path
                d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0
                4.34 4.34a8 8 0 0 0 11.32 11.32zM9 5h2v6H9V5zm0 8h2v2H9v-2z"
              />
            {/if}
          </svg>
        </div>
        <div>
          <p class="my-1 font-bold">{title}</p>
          <p class="my-1 text-sm">{message}</p>
        </div>
        <!-- <span class="absolute top-0 bottom-0 right-0 px-4 py-3"> -->
        <div>
          <svg
            class="notification-svg ml-4 cursor-pointer"
            class:default={type === 'default'}
            class:danger={type === 'danger'}
            on:click={() => close(id)}
            on:keypress|preventDefault={(e) => e.key === 'Escape' && close(id)}
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path
              d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1
              1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10
              8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0
              1.698z"
            />
          </svg>
        </div>
      </div>
    </div>
  {/each}
</div>

<style type="text/postcss">
  .notification-container {
    @apply fixed top-0 right-0 m-2 z-50 max-w-md justify-end flex flex-col items-end;
  }

  .notification-card {
    @apply border-t-4 rounded-lg px-4 py-3 shadow-md w-auto mt-2;
  }

  .notification-card.default {
    @apply bg-teal-100 border-teal-500 text-teal-900;
  }

  .notification-card.danger {
    @apply bg-red-100 border-red-500 text-red-900;
  }

  .notification-svg {
    @apply fill-current h-6 w-6;
  }

  .notification-svg.default {
    @apply text-teal-500;
  }

  .notification-svg.danger {
    @apply text-red-500;
  }
</style>
