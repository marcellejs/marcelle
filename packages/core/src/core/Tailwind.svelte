<style global lang="postcss">
@tailwind base;
@tailwind components;
@tailwind utilities;

button {
  @apply text-teal-500 bg-transparent border border-solid border-teal-500 font-bold uppercase text-xs px-4 py-2 rounded outline-none mr-1 mb-1;
  transition: all .15s ease;
}

button:hover {
  @apply bg-teal-500 text-white;
}

button:focus {
  @apply outline-none;
}

button:active {
  @apply bg-teal-600;
}

body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.card {
  @apply border border-indigo-500 rounded relative p-1 m-1 max-w-sm overflow-hidden;
}

.card:hover {
  @apply border-indigo-500 shadow-md;
}

.card-title {
  /* @apply bg-indigo-500 text-white px-2 py-1 text-xs absolute left-0 top-0 rounded-br; */
  @apply bg-indigo-500 text-white px-2 py-1 text-xs absolute right-0 top-0 rounded-bl;
}
</style>