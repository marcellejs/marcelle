<script>
  import { count, instances } from './dataset.store';
  export let title;
</script>

<span class="card-title">{title}</span>
<p>This dataset contains {$count} instance{$count > 1 ? 's' : ''}.</p>

<div class="flex flex-wrap">
  {#each Object.values($instances) as { thumbnail }}
    <img src={thumbnail} alt="thumbnail" width="40" class="p-1" />
  {/each}
</div>
