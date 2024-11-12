<script>
  import { showDashboard } from '$lib/marcelle/dashboard';
</script>

<svelte:head>
  <title>Dashboard (for development)</title>
</svelte:head>

<div class="content">
  <div class="prose mb-4">
    <h1>Dashboard</h1>
    <p>
      It is still possible to use dashboards for prototyping purposes, and to
      display them on demand in the application:
    </p>
  </div>

  <button class="btn btn-outline" onclick={showDashboard}>Show Dashboard</button
  >
</div>

<style>
  .content {
    width: 100%;
    max-width: var(--column-width);
    margin: var(--column-margin-top) auto 0 auto;
  }
</style>
