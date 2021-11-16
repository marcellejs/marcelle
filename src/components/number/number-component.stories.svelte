<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { number } from './';
  import { onMount } from 'svelte';

  const t = number();
  t.title = "The number's title";

  onMount(() => {
    t.mount();
  });
</script>

<Meta
  title="Components/Number"
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
