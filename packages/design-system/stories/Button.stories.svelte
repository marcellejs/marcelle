<script>
	import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
	import Button from './Button.svelte';
</script>

<Meta
	title="Design System/Button"
	component={Button}
	argTypes={{
		variant: {
			control: { type: 'select', options: ['outline', 'filled', 'light'] }
		},
		size: {
			control: { type: 'select', options: ['small', 'medium', 'large'] }
		},
		type: {
			control: { type: 'select', options: ['default', 'success', 'warning', 'danger'] }
		},
		disabled: { control: 'boolean' },
		onClick: { action: 'onClick' },
		onPressed: { action: 'onPressed' }
	}}
/>

<Template let:args>
	<Button {...args} on:click={args.onClick} on:pressed={args.onPressed}>Default</Button>
	<!-- <Button {...args} type="success">Success</Button>
  <Button {...args} type="warning">Warning</Button>
  <Button {...args} type="danger">Danger</Button>
  <Button {...args} disabled>Disabled</Button> -->
</Template>

<Story name="Default" />

<Story
	name="Filled"
	args={{
		variant: 'filled'
	}}
/>

<Story
	name="Light"
	args={{
		variant: 'light'
	}}
/>

<Story
	name="Small"
	args={{
		size: 'small'
	}}
/>

<Story
	name="Large"
	args={{
		size: 'large'
	}}
/>

<Story
	name="Danger"
	args={{
		type: 'danger'
	}}
/>
