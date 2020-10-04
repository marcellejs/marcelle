<script>
  import Select from '../../ui/widgets/Select.svelte';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title;
  export let options;
  export let value;
</script>

<ModuleBase {title}>
  <Select {options} {value} />
</ModuleBase>
