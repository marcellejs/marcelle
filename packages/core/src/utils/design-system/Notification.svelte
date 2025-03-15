<script lang="ts">
  import { blur } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'default' | 'danger';
  }

  interface Props {
    notifications?: Notification[];
  }

  let { notifications = $bindable([]) }: Props = $props();

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

  function handleKeyPress(e: KeyboardEvent, id: number) {
    e.preventDefault();
    if (e.key === 'Escape') {
      close(id);
    }
  }
</script>

<div class="notification-container">
  {#each notifications.slice(0, 10) as { title, message, type, id } (id)}
    <div
      transition:blur={{ amount: 10 }}
      animate:flip
      class="notification-card"
      role="alert"
      class:default={type === 'default'}
      class:danger={type === 'danger'}
    >
      <div class="mcl:flex mcl:items-start">
        <div class="mcl:py-1">
          <svg
            class="notification-svg mcl:mr-4"
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
          <p class="mcl:my-1 mcl:font-bold">{title}</p>
          <p class="mcl:my-1 mcl:text-sm">{message}</p>
        </div>
        <div>
          <svg
            class="notification-svg mcl:ml-4 mcl:cursor-pointer"
            class:default={type === 'default'}
            class:danger={type === 'danger'}
            onclick={() => close(id)}
            onkeypress={(e) => handleKeyPress(e, id)}
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            tabindex="0"
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
  @reference "../../styles.css";

  .notification-container {
    @apply mcl:fixed mcl:right-0 mcl:top-0 mcl:z-50 mcl:m-2 mcl:flex mcl:max-w-md mcl:flex-col mcl:items-end mcl:justify-end;
  }

  .notification-card {
    @apply mcl:mt-2 mcl:w-auto mcl:rounded-lg mcl:border-t-4 mcl:px-4 mcl:py-3 mcl:shadow-md;
  }

  .notification-card.default {
    @apply mcl:border-teal-500 mcl:bg-teal-100 mcl:text-teal-900;
  }

  .notification-card.danger {
    @apply mcl:border-red-500 mcl:bg-red-100 mcl:text-red-900;
  }

  .notification-svg {
    @apply mcl:h-6 mcl:w-6 mcl:fill-current;
  }

  .notification-svg.default {
    @apply mcl:text-teal-500;
  }

  .notification-svg.danger {
    @apply mcl:text-red-500;
  }
</style>
