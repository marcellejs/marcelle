<script lang="ts">
  import { base } from '$app/paths';
  import { store } from '$lib/marcelle/store';
  import type { User } from '@marcellejs/core';
  import type { Subscription } from 'rxjs/internal/Subscription';
  import { onDestroy, onMount } from 'svelte';

  let user: User;

  let sub: Subscription;
  onMount(() => {
    sub = store.$status.subscribe((s) => {
      if (s === 'connected') {
        console.log(store.user);
        user = store.user as User;
      }
    });
  });

  onDestroy(() => sub.unsubscribe());

  function logout() {
    store.logout();
  }
</script>

<div class="dropdown dropdown-end">
  <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
    <div class="w-10 rounded-full p-2">
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
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    </div>
  </div>
  <ul
    class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-64"
  >
    {#if !user || user?.role === 'anonymous'}
      <li><a href="{base}/login">Login</a></li>
    {:else}
      <li class="menu-title">
        <span>Bonjour, <strong>{user?.email}</strong></span>
      </li>
      <li>
        <button class="justify-between">
          Préférences
          <span class="badge badge-success">Nouveau!</span>
        </button>
      </li>
      <li>
        <button on:click={logout} class="btn-error">Me déconnecter</button>
      </li>
    {/if}
  </ul>
</div>
