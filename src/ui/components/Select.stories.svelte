<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Select from './Select.svelte';

</script>

<Meta
  title="Design System/Select"
  component={Select}
  argTypes={{
    value: { control: 'text' },
    options: { control: 'array' },
    disabled: { control: 'boolean' },
    onValue: { action: 'onValue' },
  }}
/>

<Template let:args>
  <Select {...args} on:value={args.onValue} />
</Template>

<Story
  name="Default"
  args={{
    options: ['one', 'two', 'three'],
    value: 'two',
  }}
/>
