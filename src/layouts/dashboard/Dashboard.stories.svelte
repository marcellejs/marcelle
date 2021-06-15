<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { Stream } from '../../core';
  import Dashboard from './Dashboard.svelte';
  import { DashboardPage } from './dashboard_page';
  import { DashboardSettings } from './dashboard_settings';
</script>

<Meta
  title="Layouts/Dashboard"
  component={Dashboard}
  parameters={{
    backgrounds: { default: 'dashboard' },
    layout: 'fullscreen',
  }}
  argTypes={{
    title: { control: { type: 'text' } },
    author: { control: { type: 'text' } },
    onQuit: { action: 'onQuit' },
  }}
/>

<Template let:args>
  <Dashboard {...args} on:quit={args.onQuit} />
</Template>

<Story
  name="Default"
  args={{
    title: 'Welcome',
    author: 'Jane Doe',
    dashboards: {
      'First Page': new DashboardPage('First Page'),
      'Second Page': new DashboardPage('Second Page'),
    },
    settings: new DashboardSettings(),
    page: new Stream('first'),
    closable: false,
  }}
/>
