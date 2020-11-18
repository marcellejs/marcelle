<script>
  import { createEventDispatcher } from 'svelte';
  import Modal from '../ui/util/Modal.svelte';

  const dispatch = createEventDispatcher();

  export let dataStore;
  export let mode = 'login';

  let loginError = null;

  function toggleMode() {
    mode = mode === 'login' ? 'register' : 'login';
  }

  async function login(e) {
    const data = new FormData(e.target);
    try {
      await dataStore.login(data.get('email'), data.get('password'));
      terminate(true);
    } catch (error) {
      loginError = error;
      // terminate(false);
    }
  }

  async function signup(e) {
    const data = new FormData(e.target);
    try {
      await dataStore.signup(data.get('email'), data.get('password'));
      terminate(true);
    } catch (error) {
      terminate(false);
    }
  }

  export function terminate(success) {
    dispatch('terminate', success);
  }
</script>

<style type="text/postcss">
</style>

<Modal>
  <div class="p-12">
    <div class="p-4 text-center">
      <h2>
        {#if mode === 'login'}Log In{:else}Register{/if}
      </h2>
    </div>
    {#if loginError}
      <div class="text-white px-6 py-4 border-0 rounded relative mb-4 bg-red-500">
        <span class="text-xl inline-block mr-5 align-middle"> <i class="fas fa-bell" /> </span>
        <span class="inline-block align-middle mr-8">
          <b class="capitalize">Login Error</b>
          {loginError}
        </span>
        <button
          class="absolute bg-transparent text-2xl font-semibold leading-none right-0 top-0 mt-4 mr-6 outline-none focus:outline-none">
          <span>×</span>
        </button>
      </div>
    {/if}
    <form on:submit|preventDefault={(e) => (mode === 'login' ? login(e) : signup(e))}>
      <div class="relative w-full mb-3">
        <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="grid-password">
          Email
        </label>
        <input
          type="email"
          name="email"
          class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4
        text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          placeholder="Email"
          style="transition: all 0.15s ease 0s;" />
      </div>
      <div class="relative w-full mb-3">
        <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="grid-password">
          Password
        </label>
        <input
          type="password"
          name="password"
          class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4
        text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
          placeholder="Password"
          style="transition: all 0.15s ease 0s;" />
      </div>
      <div class="text-center mt-6">
        <button
          class="bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full"
          type="submit"
          style="transition: all 0.15s ease 0s;">
          {#if mode === 'login'}Log In{:else}Register{/if}
        </button>
      </div>
    </form>
    <p class="my-4">
      {#if mode === 'login'}
        Don't have an account?
        <button on:click={toggleMode}>Register Here</button>
      {:else}Already have an account? <button on:click={toggleMode}>Log In</button>{/if}
    </p>
  </div>
</Modal>
