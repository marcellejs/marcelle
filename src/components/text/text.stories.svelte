<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { text } from './';
  import { onMount } from 'svelte';

  const t = text(`<div>
      You can put some <strong>HTML</strong> here...<br><br>
      <img src="https://media.giphy.com/media/10KTdhr5Zzq6uA/giphy.gif">
      </div>`);
  t.title = "The text's title";

  onMount(() => {
    t.mount();
  });
</script>

<Meta
  title="Components/Text"
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
