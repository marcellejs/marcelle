<script>
  import ModuleBase from '../../core/ModuleBase.svelte';
  import Spinner from '../../ui/widgets/Spinner.svelte';

  export let title;
  export let backend;

  function logout() {
    backend.logout();
  }
</script>

<style>
</style>

<ModuleBase {title}>
  {#if backend.requiresAuth}
    {#await backend.connect()}
      <Spinner />
    {:then user}
      <p class="pb-2">Hello, {user.email}</p>
      <div class="flex"><button class="btn danger" on:click={logout}>Log out</button></div>
    {/await}
  {:else}
    <div>This backend does not require authentication</div>
  {/if}
</ModuleBase>
