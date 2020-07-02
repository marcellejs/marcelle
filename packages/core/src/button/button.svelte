<script>
  import { click } from './button.store';
  export let text;

  function sendClick(event) {
    click.set(event);
  }
</script>

<button on:click={sendClick}>{text}</button>