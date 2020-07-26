<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

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
    @apply bg-white border border-indigo-500 rounded-lg relative p-1 m-1;
  }

  .card:hover {
    @apply border-indigo-500 shadow;
  }

  .card-title {
    @apply bg-indigo-500 text-white px-2 py-1 text-xs absolute right-0 top-0 rounded-bl-lg rounded-tr-md z-10;
  }

  .wizard .card-title {
    display: none;
  }
</style>
