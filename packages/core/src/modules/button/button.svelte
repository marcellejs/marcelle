<script>
  import { click, text } from './button.store';

  function sendClick(event) {
    click.set(event);
  }
</script>

<svelte:options accessors />

<span class="card-title">button</span>
<button on:click={sendClick}>{$text}</button>
