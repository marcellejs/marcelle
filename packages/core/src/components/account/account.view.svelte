<script lang="ts">
  import type { DataStore } from '../../core/data-store';

  interface Props {
    dataStore: DataStore;
  }

  let { dataStore }: Props = $props();

  function logout() {
    dataStore.logout();
  }
</script>

{#if dataStore.requiresAuth}
  {#await dataStore.connect()}
    <div class="mcl:flex mcl:min-h-28 mcl:w-full mcl:flex-col mcl:items-center mcl:justify-center">
      <span class="mcl:loading mcl:loading-spinner mcl:loading-lg"></span>
      <span>Connecting</span>
    </div>
  {:then user}
    <p class="mcl:pb-2">Hello, {user.email}</p>
    <div class="mcl:flex">
      <button class="mcl:btn mcl:btn-error" onclick={logout}>Log out</button>
    </div>
  {/await}
{:else}
  <div>This dataStore does not require authentication</div>
{/if}
