<script lang="ts">
  import type { DataStore } from '../../core/data-store';
  import { ViewContainer } from '@marcellejs/design-system';

  export let title: string;
  export let dataStore: DataStore;

  function logout() {
    dataStore.logout();
  }
</script>

<ViewContainer {title}>
  {#if dataStore.requiresAuth}
    {#await dataStore.connect()}
      <div class="w-full min-h-28 flex flex-col justify-center items-center">
        <span class="loading loading-spinner loading-lg"></span>
        <span>Connecting</span>
      </div>
    {:then user}
      <p class="pb-2">Hello, {user.email}</p>
      <div class="flex"><button class="btn danger" on:click={logout}>Log out</button></div>
    {/await}
  {:else}
    <div>This dataStore does not require authentication</div>
  {/if}
</ViewContainer>
