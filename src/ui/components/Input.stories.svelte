<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Input from './Input.svelte';
</script>

<Meta
  title="Design System/Input"
  component={Input}
  argTypes={{
    disabled: { control: 'boolean' },
    type: {
      control: { type: 'select', options: ['text', 'email'] },
    },
    onChange: { action: 'onChange' },
  }}
/>

<Template let:args>
  <Input {...args} on:change={args.onChange} />
</Template>

<Story
  name="Default"
  args={{
    placeholder: 'Enter some text',
  }}
/>

<Story
  name="Email"
  args={{
    placeholder: 'Enter an email',
    type: 'email',
  }}
/>

<Story
  name="Password"
  args={{
    placeholder: 'Enter a password',
    type: 'password',
  }}
/>
