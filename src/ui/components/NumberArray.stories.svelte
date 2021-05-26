<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { Stream } from '../../core';
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
    stream: new Stream([12, 24, 48]),
  }}
/>
