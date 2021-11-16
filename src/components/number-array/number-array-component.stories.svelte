<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { numberArray } from './';
  import { onMount } from 'svelte';

  const t = numberArray();
  t.title = "The numberArray's title";

  onMount(() => {
    t.mount();
  });
</script>

<Meta
  title="Components/NumberArray"
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
