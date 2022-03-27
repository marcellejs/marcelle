<script>
  import GithubLogo from './GithubLogo.svelte';
  import GlitchLogo from './GlitchLogo.svelte';

  export let demo;
</script>

<div class="demo">
  <div>
    <h3>{demo.name}</h3>
    <div class="description">{demo.description}</div>
  </div>
  <div class="buttons">
    <a class="btn" href="/{demo.path}/">
      Open Demo
      <svg
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        class="icon"
        viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg
      >
    </a>
    <a
      class="btn code"
      target="_blank"
      href="https://github.com/marcellejs/demos/tree/main/{demo.path}/"
    >
      View Source
      <GithubLogo />
    </a>
    {#if demo.glitch}
      <a class="btn code" href={demo.glitch} target="_blank">
        Remix on Glitch
        <GlitchLogo />
      </a>
    {/if}
  </div>
</div>

<style>
  .demo {
    background-color: white;
    border: 2px solid rgb(226, 232, 240);
    border-radius: 0.5rem;
    margin: 8px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  h3 {
    margin: 0;
    padding-bottom: 8px;
    font-size: 1.3rem;
    font-weight: 500;
    border-bottom: 1px solid rgb(237, 242, 247);
  }

  .description {
    text-align: left;
    padding-top: 8px;
    color: rgb(74, 85, 104);
  }

  a.btn {
    background-color: #3d405b;
    flex-grow: 1;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    display: flex;
    align-items: center;
    border-radius: 0.25rem;
    color: white;
    text-decoration: none;
    margin-top: 20px;
  }

  a.btn:hover {
    background-color: seagreen;
  }

  a.btn.code {
    justify-content: space-between;
    font-size: 0.9em;
    margin-top: 10px;
    border: 1px solid lightslategray;
    background-color: transparent;
    color: lightslategray;
    flex-grow: 0;
    font-weight: 400;
    padding-top: 0.3rem;
    padding-bottom: 0.3rem;
  }

  a.btn.code:hover {
    color: #435e7a;
    border-color: #435e7a;
  }

  .icon {
    width: 1rem;
    height: 1rem;
    margin-left: auto;
  }
</style>
