<script lang="ts">
  import ModuleBase from '../core/ModuleBase.svelte';
  import type { DataStore } from '../data-store';
  import Spinner from '../ui/widgets/Spinner.svelte';

  export let dataStore: DataStore;

  $: services = dataStore.$services;

  function logout() {
    dataStore.logout();
  }
</script>

<style>
</style>

<ModuleBase title="data store ({dataStore.location})">
  {#if dataStore.requiresAuth}
    {#await dataStore.connect()}
      <Spinner />
    {:then user}
      <p class="pb-2">Hello, {user.email}</p>
      <div class="flex"><button class="btn danger" on:click={logout}>Log out</button></div>
    {/await}
    <!-- {:else}
    <div>This dataStore does not require authentication</div> -->
  {/if}
  {#if $services}
    <div>This data store contains the following services: {$services.join(', ')}</div>
  {/if}
</ModuleBase>
