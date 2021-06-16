<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import { Stream } from '../../core';
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
    stream: new Stream(12),
  }}
/>
