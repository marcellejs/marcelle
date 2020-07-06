<script>
  import { timer, active } from './webcam.store';
  export let title;
</script>

<span class="card-title">{title}</span>
<p>Time elapsed: {$timer}</p>
<p>active: {$active}</p>

