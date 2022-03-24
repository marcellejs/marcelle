<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
	export function quit(): void {
		dispatch('quit');
	}

	function onOutsideClick() {
		quit();
	}
</script>

<div class="modal-container">
	<div class="overlay">
		<div on:click={onOutsideClick} class="absolute inset-0 bg-gray-500 opacity-50" />
	</div>
	<div class="modal">
		<slot />
	</div>
</div>

<style type="text/postcss">
	.modal-container {
		@apply absolute min-h-screen top-0 inset-x-0 p-4 pb-4  z-20;
	}

	@screen sm {
		.modal-container {
			@apply flex items-center justify-center;
		}
	}

	.overlay {
		@apply absolute min-h-screen inset-0 transition-opacity;
	}

	.modal {
		@apply bg-white rounded-lg overflow-hidden shadow-xl transform transition-all;
	}

	@screen sm {
		.modal {
			@apply max-w-3xl w-full;
		}
	}
</style>
