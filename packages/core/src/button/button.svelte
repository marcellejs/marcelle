<script>
  import { click, text } from './button.store';

  function sendClick(event) {
    click.set(event);
  }
</script>
<svelte:options accessors/>

<button on:click={sendClick}>{$text}</button>