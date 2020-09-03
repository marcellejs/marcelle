<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  h2 {
    @apply text-lg mx-1 p-1;
  }

  .btn {
    @apply text-teal-500 bg-transparent border border-solid border-teal-500 font-bold uppercase text-xs px-4 py-2 rounded outline-none mr-1 mb-1;
    transition: all 0.15s ease;
  }

  .btn:hover {
    @apply bg-teal-500 text-white;
  }

  .btn:focus {
    @apply outline-none;
  }

  .btn:active {
    @apply bg-teal-600;
  }

  .btn:disabled,
  .btn[disabled],
  .btn:hover[disabled] {
    @apply bg-gray-200 border-gray-400 cursor-default text-gray-600;
  }

  .btn.danger {
    @apply text-red-600 border-red-600;
  }

  .btn.danger:hover {
    @apply bg-red-600 text-white;
  }

  .btn.danger:active {
    @apply bg-red-800;
  }

  .card {
    @apply bg-white rounded-lg relative mx-1 my-2 p-2 shadow-sm;
  }

  .card:hover {
    @apply border-indigo-500 shadow;
  }

  .card-title {
    @apply block text-indigo-600 mb-2 text-xs;
  }

  .wizard .card-title {
    display: none;
  }
</style>
