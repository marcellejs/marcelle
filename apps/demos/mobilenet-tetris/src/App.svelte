<script>
  import { onDestroy, onMount, createEventDispatcher, tick } from 'svelte';

  const dispatch = createEventDispatcher();

  export let input;
  export let sel;
  export let browser;
  export let predictedLabel;
  let msg = '';

  function record() {
    msg = '3';
    setTimeout(() => {
      msg = '2';
    }, 1000);
    setTimeout(() => {
      msg = '1';
    }, 2000);
    setTimeout(() => {
      msg = 'recording...';
      dispatch('recording', true);
    }, 3000);
    setTimeout(() => {
      msg = '';
      dispatch('recording', false);
    }, 5000);
  }

  let mobilenetElt;
  onMount(async () => {
    await tick();
    input.mount(mobilenetElt);
    browser.mount();
    sel.mount();
  });

  onDestroy(() => {
    input.destroy();
    browser.destroy();
    sel.destroy();
  });

  function clearDataset() {
    dispatch('clearDataset');
  }
</script>

<div id="left">
  <!-- <h1 style="font-size: 1.6rem; padding: 6px;">Body Tetris (sort of)</h1> -->
  <div style="display: flex">
    <div bind:this={mobilenetElt} id="mobilenet" style="width: 440px;" />
    <div id="controls">
      <p>Select an action and record associated postures:</p>
      <div id={sel.id} style="margin-bottom: 5px" />
      <button class="btn" on:click={record} style="margin-bottom: 5px">Record Postures</button>
      <button class="btn danger" on:click={clearDataset}>Clear Data</button>
      <p style="color: grey; font-size: 0.8em; margin-top: 20px;">Predicted label:</p>
      <div class="label">{$predictedLabel}</div>
    </div>
  </div>
  <div id={browser.id} />
  <div id="counter" class:active={msg !== ''}>
    <span style="background-color: rgba(255, 255, 255, 0.7); padding: 30px;">{msg}</span>
  </div>
</div>

<style>
  #left {
    width: calc(100vw - 640px);
    padding: 20px;
    border-right: 1px solid grey;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  #left #controls {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
    padding-top: 30px;
  }

  #counter {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    font-size: 4rem;
    display: none;
    justify-content: center;
    align-items: center;
  }

  #counter.active {
    display: flex;
  }

  .label {
    font-size: 2rem;
    width: 100%;
    text-align: center;
  }
</style>
