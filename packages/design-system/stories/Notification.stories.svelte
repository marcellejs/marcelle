<script>
  import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';
  import Notification from './Notification.svelte';

  let notifElt = null;
  function addNotification() {
    const type = Math.random() > 0.5 ? 'default' : 'danger';
    const duration = Math.random() > 0.5 ? 3000 : 0;
    notifElt.add({
      title: 'Hello there!',
      message: `I am a "${type}" notification of duration ${duration}`,
      type,
      duration,
    });
  }

</script>

<Meta title="Design System/Notification" component={Notification} />

<Template let:args>
  <Button on:click={addNotification}>Add Notification</Button>
  <Notification bind:this={notifElt} {...args} />
</Template>

<Story name="Default" />
