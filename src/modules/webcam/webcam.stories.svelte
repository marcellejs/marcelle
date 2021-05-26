<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { webcam } from './';
  import { onMount } from 'svelte';

  const w = webcam();

  onMount(() => {
    w.mount();
  });
</script>

<Meta
  title="Modules/Webcam"
  parameters={{ backgrounds: { default: 'dashboard' } }}
  argTypes={{
    width: {
      control: { type: 'select', options: ['350px', '100%'] },
    },
  }}
/>

<Template let:args>
  <div id={w.id} class="marcelle card" style="width: {args.width};" />
</Template>

<Story name="Default" args={{ width: '350px' }} />
