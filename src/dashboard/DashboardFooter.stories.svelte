<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import DashboardFooter from './DashboardFooter.svelte';

</script>

<Meta
  title="Layouts/DashboardFooter"
  component={DashboardFooter}
  parameters={{
    backgrounds: { default: 'dashboard' },
    layout: 'fullscreen',
  }}
  argTypes={{
    author: { control: { type: 'text' } },
  }}
/>

<Template let:args>
  <div class="marcelle">
    <DashboardFooter {...args} on:quit={args.onQuit} />
  </div>
</Template>

<Story
  name="Default"
  args={{
    author: 'Marcelle',
  }}
/>
