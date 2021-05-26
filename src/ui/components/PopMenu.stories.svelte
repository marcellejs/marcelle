<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import PopMenu from './PopMenu.svelte';

</script>

<Meta
  title="Design System/PopMenu"
  component={PopMenu}
  parameters={{
    backgrounds: { default: 'dashboard' },
  }}
  argTypes={{
    actions: { control: 'object' },
    onSelect: { action: 'onSelect' },
  }}
/>

<Template let:args>
  <div class="w-64 p-8 m-6 flex justify-end">
    <PopMenu {...args} on:select={args.onSelect} />
  </div>
</Template>

<Story
  name="Default"
  args={{
    actions: [
      { code: 'edit', text: 'Edit class label' },
      { code: 'delete', text: 'Delete class' },
    ],
  }}
/>
