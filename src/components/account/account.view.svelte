<script lang="ts">
  import ViewContainer from '../../core/ViewContainer.svelte';
  import type { DataStore } from '../../data-store';
  import Spinner from '../../ui/components/Spinner.svelte';

  export let title: string;
  export let dataStore: DataStore;

  function logout() {
    dataStore.logout();
  }

</script>

<ViewContainer {title}>
  {#if dataStore.requiresAuth}
    {#await dataStore.connect()}
      <Spinner />
    {:then user}
      <p class="pb-2">Hello, {user.email}</p>
      <div class="flex"><button class="btn danger" on:click={logout}>Log out</button></div>
    {/await}
  {:else}
    <div>This dataStore does not require authentication</div>
  {/if}
</ViewContainer>
