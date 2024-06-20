<script lang="ts">
  import { ViewContainer } from '@marcellejs/design-system';
  import type { DataStore } from '../../core';
  import { Button, Spinner } from '@marcellejs/design-system';

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
        <div class="flex"><Button on:click={signin}>Sign in</Button></div>
      {:else}
        <p class="pb-2">Hello, {user.email}</p>
        <div class="flex"><Button on:click={logout}>Log out</Button></div>
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
