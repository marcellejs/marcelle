<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { button } from './';
  import { onMount } from 'svelte';

  const b = button({ text: 'The button text' });
  b.title = "The button's title";

  onMount(() => {
    b.mount();
  });

</script>

<Meta
  title="Modules/Button"
  parameters={{ backgrounds: { default: 'dashboard' } }}
  argTypes={{
    width: {
      control: { type: 'select', options: ['350px', '100%'] },
    },
  }}
/>

<Template let:args>
  <div id={b.id} class="marcelle card" style="width: {args.width};" />
</Template>

<Story name="Default" args={{ width: '350px' }} />
