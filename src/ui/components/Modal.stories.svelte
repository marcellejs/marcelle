<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';
  import Modal from './Modal.svelte';

</script>

<Meta
  title="Design System/Modal"
  component={Modal}
  parameters={{ backgrounds: { default: 'dashboard' } }}
/>

<Story name="Default">
  <Modal>
    <div class="marcelle p-4">
      <h3>Hello</h3>
      <p>Here is a simple modal window with some buttons</p>
      <div class="flex justify-end">
        <Button>Cancel</Button>
        <span class="w-1" />
        <Button variant="filled">Confirm</Button>
      </div>
    </div>
  </Modal>
</Story>
