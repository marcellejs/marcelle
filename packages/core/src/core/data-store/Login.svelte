<script lang="ts">
  import type { DataStore } from './data-store';
  import type { User } from '../types';

  interface Props {
    dataStore: DataStore;
    mode?: 'login' | 'register';
    onterminate: (u: User) => void;
  }

  let { dataStore, mode = $bindable('login'), onterminate }: Props = $props();

  interface LoginError extends Error {
    data: { email: string; password: string };
  }
  let loginError: LoginError | undefined = $state();

  export function terminate(user: User): void {
    onterminate(user);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function processError(error: any): LoginError {
    if (error.name === 'Conflict') {
      if (error.message.includes('email')) {
        error.data = { email: error.message };
      } else if (error.message.includes('username')) {
        error.data = { username: error.message };
      }
    } else if (Array.isArray(error.data) && error.data.length > 0) {
      error.data = error.data.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (a: any, x: any) => ({ ...a, [x.instancePath.slice(1)]: x.message }),
        {},
      );
    }
    return error as LoginError;
  }

  async function login(e: Event) {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    try {
      const user = await dataStore.login(
        data.get('email') as string,
        data.get('password') as string,
      );
      terminate(user);
    } catch (error) {
      loginError = processError(error);
      console.log('loginError', loginError?.data);
    }
  }

  async function signup(e: Event) {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    try {
      const user = await dataStore.signup({
        email: data.get('email') as string,
        password: data.get('password') as string,
      });
      terminate(user);
    } catch (error) {
      loginError = processError(error);
      console.log('loginError', loginError?.data);
      // terminate(null);
    }
  }
</script>

<dialog id="my_modal_1" class="mcl:modal mcl:modal-open">
  <div class="mcl:modal-box">
    <form method="dialog">
      <button
        class="mcl:btn mcl:btn-circle mcl:btn-ghost mcl:absolute mcl:right-2 mcl:top-2"
        onclick={() => {
          terminate(null);
        }}>✕</button
      >
    </form>
    <h3 class="mcl:mb-8 mcl:text-lg mcl:font-bold">
      {#if mode === 'login'}Log In{:else}Register{/if}
    </h3>

    {#if loginError}
      <div role="alert" class="mcl:alert mcl:alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mcl:h-6 mcl:w-6 mcl:shrink-0 mcl:stroke-current"
          fill="none"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
        <span>Erreur de connexion ({loginError.name}): {loginError.message}</span>
      </div>
    {/if}

    {#if mode === 'login'}
      <form onsubmit={login}>
        <div class="mcl:form-control mcl:w-full">
          <label class="mcl:label" for="email">
            <span class="mcl:label-text">Email</span>
          </label>
          <label class="mcl:input mcl:input-bordered mcl:flex mcl:items-center mcl:gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="mcl:h-4 mcl:w-4 mcl:opacity-70"
              ><path
                d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"
              /><path
                d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"
              /></svg
            >
            <input type="text" name="email" class="mcl:grow" placeholder="Email" />
          </label>
        </div>
        <div class="mcl:form-control mcl:w-full">
          <label class="mcl:label" for="password">
            <span class="mcl:label-text">Password</span>
          </label>
          <label class="mcl:input mcl:input-bordered mcl:flex mcl:items-center mcl:gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="mcl:h-4 mcl:w-4 mcl:opacity-70"
              ><path
                fill-rule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clip-rule="evenodd"
              /></svg
            >
            <input type="password" name="password" class="mcl:grow" placeholder="Mot de passe" />
          </label>
        </div>
        <div class="mcl:flex mcl:justify-end">
          <button class="mcl:btn mcl:btn-primary mcl:bordered mcl:mt-6" type="submit">
            Log In
          </button>
        </div>
      </form>
      <div class="mcl:mt-8 mcl:text-right">
        No Account?

        <button
          class="mcl:link"
          onclick={() => {
            mode = 'register';
          }}>Create an account now</button
        >
      </div>
    {:else}
      <form onsubmit={signup}>
        <div class="mcl:form-control mcl:w-full">
          <label class="mcl:label" for="email">
            <span class="mcl:label-text">Email</span>
          </label>
          <label
            class="mcl:input mcl:input-bordered mcl:flex mcl:items-center mcl:gap-2"
            class:mcl:input-error={loginError?.data?.email}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="mcl:h-4 mcl:w-4 mcl:opacity-70"
              ><path
                d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"
              /><path
                d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"
              /></svg
            >
            <input type="text" name="email" class="mcl:grow" placeholder="Email" />
          </label>
          {#if loginError?.data?.email}
            <div class="mcl:label">
              <span class="mcl:label-text-alt mcl:text-error">{loginError?.data?.email}</span>
            </div>
          {/if}
        </div>
        <div class="mcl:form-control mcl:w-full">
          <label class="mcl:label" for="password">
            <span class="mcl:label-text">Choose a password</span>
          </label>
          <label
            class="mcl:input mcl:input-bordered mcl:flex mcl:items-center mcl:gap-2"
            class:mcl:input-error={loginError?.data?.password}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="mcl:h-4 mcl:w-4 mcl:opacity-70"
              ><path
                fill-rule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clip-rule="evenodd"
              /></svg
            >
            <input type="password" name="password" class="mcl:grow" placeholder="Mot de passe" />
          </label>
          {#if loginError?.data?.password}
            <div class="mcl:label">
              <span class="mcl:label-text-alt mcl:text-error">
                {loginError?.data?.password}
              </span>
            </div>
          {/if}
        </div>
        <div class="mcl:flex mcl:justify-end">
          <button class="mcl:btn mcl:btn-primary mcl:bordered mcl:mt-6" type="submit">
            Log In
          </button>
        </div>
      </form>
      <div class="mcl:mt-8 mcl:text-right">
        Already have an account?

        <button
          class="mcl:link"
          onclick={() => {
            mode = 'login';
          }}
        >
          Log In
        </button>
      </div>
    {/if}
  </div>
</dialog>
