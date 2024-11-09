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
    <div class="flex min-h-28 w-full flex-col items-center justify-center">
      <span class="mco-loading mco-loading-spinner mco-loading-lg"></span>
      <span>Connecting</span>
    </div>
  {:then user}
    <p class="pb-2">Hello, {user.email}</p>
    <div class="flex">
      <button class="mco-btn mco-btn-error" onclick={logout}>Log out</button>
    </div>
  {/await}
{:else}
  <div>This dataStore does not require authentication</div>
{/if}
