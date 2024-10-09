<script lang="ts">
  import type { DataStore } from '../../core/data-store';
  import ViewContainer from './ViewContainer.svelte';

  export let dataStore: DataStore;

  $: services = dataStore.$services;

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
      <div class="w-full min-h-28 flex flex-col justify-center items-center">
        <span class="loading loading-spinner loading-lg"></span>
        <span>Connecting</span>
      </div>
    {:then user}
      {#if user.role === 'anonymous'}
        <p>You are not authenticated.</p>
        <div class="flex"><button class="btn btn-outline" on:click={signin}> Sign in </button></div>
      {:else}
        <p class="pb-2">Hello, {user.email}</p>
        <div class="flex"><button class="btn btn-outline" on:click={logout}> Log out </button></div>
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
