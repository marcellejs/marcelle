<script>
  import { timer, active } from './webcam.store';
  export let title;
</script>

<div class="card">
  <h4>{title}</h4>
  <p>Time elapsed: {$timer}</p>
  <p>active: {$active}</p>
</div>

<style>
.card {
  padding: 10px;
  border: 1px solid grey;
  border-radius: 5px;
}
</style>