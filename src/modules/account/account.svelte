<script>
  import ModuleBase from '../../core/ModuleBase.svelte';
  import Spinner from '../../ui/widgets/Spinner.svelte';

  export let title;
  export let dataStore;

  function logout() {
    dataStore.logout();
  }
</script>

<style>
</style>

<ModuleBase {title}>
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
</ModuleBase>
