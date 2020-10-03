<script>
  import Select from '../../ui/widgets/Select.svelte';

  export let title;
  export let options;
  export let value;
</script>

<span class="card-title">{title}</span>
<Select {options} {value} />
