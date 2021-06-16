<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { imageUpload } from './';
  import { onMount } from 'svelte';

  const t = imageUpload();
  t.title = "The imageUpload's title";

  onMount(() => {
    t.mount();
  });

</script>

<Meta
  title="Components/ImageUpload"
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
