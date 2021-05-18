<script lang="ts">
  import Select from '../../ui/components/Select.svelte';
  import ModuleBase from '../../core/ModuleBase.svelte';
  import type { Stream } from '../../core';

  export let title: string;
  export let options: Stream<string[]>;
  export let value: Stream<string>;

</script>

<ModuleBase {title}>
  <Select {options} {value} />
</ModuleBase>
