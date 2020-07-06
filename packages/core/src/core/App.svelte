<script>
export let title;
export let author;
export let left = {};
export let right = {};
</script>

<div id="app">
  <header>
    <h1>{title}</h1>
    <div class="author">{author}</div>
  </header>
  <div class="row">
    <div class="left">
      {#each Object.keys(left) as tab}
        <div id={tab}>
          {#each left[tab] as id}
            <div id={id}></div>
          {/each}
        </div>
      {/each}
    </div>
    <div class="right">
      {#each Object.keys(right) as tab}
        <div id={tab}>
          {#each right[tab] as id}
            <div id={id}></div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
html,
body {
  font-family: 'Lato', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}

p {
  font-size: 0.9em;
  margin: 8px 0;
}

h1 {
  font-size: 1.4em;
}

#app {
  color: #2c3e50;
}

#app > .row {
  display: flex;
}

@media (max-width: 874px) {
  #app > .row {
    flex-direction: column;
  }
}

#app > .row > .left {
  margin-right: 20px;
  width: 350px;
  flex-shrink: 0;
}

#app > .row > .right {
  flex-grow: 1;
  max-width: calc(100% - 370px);
}
</style>
