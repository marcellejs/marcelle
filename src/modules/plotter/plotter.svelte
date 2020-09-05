<script>
  import { chart } from "svelte-apexcharts";

  export let title;
  export let options;

</script>
 
<span class="card-title">{title}</span>
<div use:chart={ $options }></div>