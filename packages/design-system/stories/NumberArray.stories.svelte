<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import NumberArray from './NumberArray.svelte';
</script>

<Meta
  title="Design System/NumberArray"
  component={NumberArray}
  argTypes={{
    disabled: { control: 'boolean' },
  }}
/>

<Template let:args>
  <NumberArray {...args} />
</Template>

<Story
  name="Default"
  args={{
    value: [12, 24, 48],
  }}
/>

<Story
  name="Float"
  args={{
    value: Array.from(Array(4), Math.random),
  }}
/>
