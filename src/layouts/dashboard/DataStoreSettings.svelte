<script lang="ts">
  import ViewContainer from '../../core/ViewContainer.svelte';
  import type { DataStore } from '../../data-store';
  import Button from '../../ui/components/Button.svelte';
  import Spinner from '../../ui/components/Spinner.svelte';

  export let dataStore: DataStore;

  $: services = dataStore.$services;

  function logout() {
    dataStore.logout();
  }

</script>

<ViewContainer title="data store ({dataStore.location})">
  {#if dataStore.requiresAuth}
    {#await dataStore.connect()}
      <Spinner />
    {:then user}
      <p class="pb-2">Hello, {user.email}</p>
      <div class="flex"><Button on:click={logout}>Log out</Button></div>
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
