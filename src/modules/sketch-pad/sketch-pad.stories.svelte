<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { sketchPad } from './';
  import { onMount } from 'svelte';

  const s = sketchPad();

  onMount(() => {
    s.mount();
  });
</script>

<Meta
  title="Modules/SketchPad"
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
