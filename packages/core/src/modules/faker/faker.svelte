<script>
  import { frames, size } from './faker.store';
  export let title;
</script>

<span class="card-title">{title}</span>
<p>size: {$size}</p>
<p>values: [{$frames.map(x => x.toFixed(2)).join(' ; ')}]</p>
