<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import type { DataStore } from '../../core/data-store';
  import { Spinner } from '@marcellejs/design-system';

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
      <Spinner />
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
    <div>This data store contains the following services: {$services.join(', ')}</div>
  {/if}
</ViewContainer>

<style>
</style>
