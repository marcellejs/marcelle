<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Switch from './Switch.svelte';

</script>

<Meta
  title="Design System/Switch"
  component={Switch}
  argTypes={{
    text: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChecked: { action: 'onChecked' },
  }}
/>

<Template let:args>
  <Switch {...args} />
</Template>

<Story
  name="Default"
  args={{
    text: 'Switch me',
  }}
/>
