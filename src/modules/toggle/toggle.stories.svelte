<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { toggle } from './';
  import { onMount } from 'svelte';

  const t = toggle();
  t.title = "The toggle's title";

  onMount(() => {
    t.mount();
  });

</script>

<Meta
  title="Modules/Toggle"
  parameters={{ backgrounds: { default: 'dashboard' } }}
  argTypes={{
    width: {
      control: { type: 'select', options: ['350px', '100%'] },
    },
  }}
/>

<Template let:args>
  <div id={t.id} class="marcelle card" style="width: {args.width};" />
</Template>

<Story name="Default" args={{ width: '350px' }} />
