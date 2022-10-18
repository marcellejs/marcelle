<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Number from './Number.svelte';
</script>

<Meta
  title="Design System/Number"
  component={Number}
  argTypes={{
    disabled: { control: 'boolean' },
  }}
/>

<Template let:args>
  <Number {...args} />
</Template>

<Story
  name="Default"
  args={{
    value: 12,
  }}
/>

<Story
  name="Float"
  args={{
    value: 12.345,
  }}
/>
