<script>
  import Tailwind from './Tailwind.svelte';

  export let title;
  export let author;
  export let left = {};
  export let right = {};
</script>

<style type="text/postcss">
  .container {
    @apply max-w-none w-screen p-1 flex flex-row flex-wrap flex-grow;
  }

  .left {
    @apply flex-shrink-0 p-1;
    width: 350px;
  }

  .right {
    @apply flex-grow p-1;
  }
</style>

<Tailwind />
<header class="text-gray-700 body-font border-b">
  <div class="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
    <a href="/" class="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        class="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full"
        viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
      <span class="ml-3 text-xl">{title}</span>
    </a>
    <nav class="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center">
      <a href="/" class="mr-5 hover:text-gray-900">Dashboard</a>
    </nav>
    <button
      class="inline-flex items-center bg-gray-200 border-0 py-1 px-3 focus:outline-none
      hover:bg-gray-300 rounded text-base mt-4 md:mt-0">
      <svg
        class="fill-current inline-block h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20">
        <path
          d="M3.94 6.5L2.22 3.64l1.42-1.42L6.5 3.94c.52-.3 1.1-.54 1.7-.7L9 0h2l.8 3.24c.6.16 1.18.4
          1.7.7l2.86-1.72 1.42 1.42-1.72 2.86c.3.52.54 1.1.7 1.7L20 9v2l-3.24.8c-.16.6-.4 1.18-.7
          1.7l1.72 2.86-1.42 1.42-2.86-1.72c-.52.3-1.1.54-1.7.7L11
          20H9l-.8-3.24c-.6-.16-1.18-.4-1.7-.7l-2.86 1.72-1.42-1.42
          1.72-2.86c-.3-.52-.54-1.1-.7-1.7L0 11V9l3.24-.8c.16-.6.4-1.18.7-1.7zM10 13a3 3 0 1 0 0-6 3
          3 0 0 0 0 6z" />
      </svg>
    </button>
  </div>
</header>
<div class="container">
  <div class="left">
    {#each Object.keys(left) as tab}
      <div id={tab}>
        {#each left[tab] as id}
          <div {id} class="card" />
        {/each}
      </div>
    {/each}
  </div>
  <div class="right">
    {#each Object.keys(right) as tab}
      <div id={tab}>
        {#each right[tab] as id}
          <div {id} class="card" />
        {/each}
      </div>
    {/each}
  </div>
</div>
<footer class="text-gray-700 body-font border-t">
  <div class="px-5 py-2 mx-full flex items-center justify-end sm:flex-row">
    <p class="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4">
      © 2020 {author}
    </p>
  </div>
</footer>
