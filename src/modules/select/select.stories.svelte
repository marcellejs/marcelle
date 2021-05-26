<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { select } from './';
  import { onMount } from 'svelte';

  const s = select({ options: ['circle', 'square', 'triangle'] });
  s.title = "The select's title";

  onMount(() => {
    s.mount();
  });

</script>

<Meta
  title="Modules/Select"
  parameters={{ backgrounds: { default: 'dashboard' } }}
  argTypes={{
    width: {
      control: { type: 'select', options: ['350px', '100%'] },
    },
  }}
/>

<Template let:args>
  <div id={s.id} class="marcelle card" style="width: {args.width};" />
</Template>

<Story name="Default" args={{ width: '350px' }} />
