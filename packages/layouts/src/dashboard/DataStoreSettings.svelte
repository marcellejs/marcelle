<script lang="ts">
  import type { DataStore } from '@marcellejs/core';
  import ViewContainer from './ViewContainer.svelte';

  interface Props {
    dataStore: DataStore;
  }

  let { dataStore }: Props = $props();

  let services = $derived(dataStore.$services);

  function logout() {
    dataStore.logout();
  }

  function signin() {
    // dataStore.login('jules@jules.com', 'lovelove');
    dataStore.loginWithUI().then(() => {
      location.reload();
    });
  }
</script>

<ViewContainer title="data store ({dataStore.location})">
  {#if dataStore.requiresAuth}
    {#await dataStore.connect()}
      <div class="flex min-h-28 w-full flex-col items-center justify-center">
        <span class="mly-loading mly-loading-spinner mly-loading-lg"></span>
        <span>Connecting</span>
      </div>
    {:then user}
      {#if user.role === 'anonymous'}
        <p>You are not authenticated.</p>
        <div class="flex">
          <button class="mly-btn mly-btn-outline" onclick={signin}> Sign in </button>
        </div>
      {:else}
        <p class="pb-2">Hello, {user.email}</p>
        <div class="flex">
          <button class="mly-btn mly-btn-outline" onclick={logout}> Log out </button>
        </div>
      {/if}
    {/await}
    <!-- {:else}
    <div>This dataStore does not require authentication</div> -->
  {/if}
  {#if $services}
    <div class="mt-6">This data store contains the following services: {$services.join(', ')}</div>
  {/if}
</ViewContainer>

<style>
</style>
