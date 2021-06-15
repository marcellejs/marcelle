<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import DashboardHeader from './DashboardHeader.svelte';
</script>

<Meta
  title="Layouts/DashboardHeader"
  component={DashboardHeader}
  parameters={{
    backgrounds: { default: 'dashboard' },
    layout: 'fullscreen',
  }}
  argTypes={{
    title: { control: { type: 'text' } },
    items: { control: { type: 'object' } },
    current: { control: { type: 'text' } },
    closable: { control: { type: 'boolean' } },
    onQuit: { action: 'onQuit' },
  }}
/>

<Template let:args>
  <div class="marcelle">
    <DashboardHeader {...args} on:quit={args.onQuit} />
  </div>
</Template>

<Story
  name="Default"
  args={{
    title: 'Dashboard Title',
    items: {
      one: 'One',
      dos: 'Dos',
      trois: 'Trois',
    },
    current: 'One',
    closable: false,
  }}
/>

<Story
  name="Closable"
  args={{
    title: 'Dashboard Title',
    items: {
      one: 'One',
      dos: 'Dos',
      trois: 'Trois',
    },
    current: 'One',
    closable: true,
  }}
/>
