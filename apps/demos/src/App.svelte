<script>
  import Select from 'svelte-select';
  import Masonry from 'svelte-bricks';

  import Demo from './Demo.svelte';
  import demos from '../meta';

  function sorted(arr) {
    const res = [...arr];
    res.sort();
    return res;
  }

  const filters = ['data', 'training', 'task', 'layout', 'features'];

  $: filterValues = filters.map(
    (f) =>
      // ['all'].concat(
      sorted(
        // eslint-disable-next-line no-undef
        Array.from(new Set(demos.flatMap((x) => x[f] || []))),
      ),
    // )
  );

  $: showDemos = demos.filter((x) => {
    const matchFilters = filters.map(
      (f, i) =>
        currentFilters[i].length === 0 ||
        currentFilters[i].reduce((a, b) => a || (x[f] || []).includes(b), false),
    );
    return matchFilters.reduce((a, b) => a && b, true);
  });

  $: currentFilters = filters.map((_, i) => []);

  let [minColWidth, maxColWidth, gap] = [300, 400, 0];
  let width, height;

  function handleSelect(values, i) {
    currentFilters[i] = (values || []).map(({ value }) => value);
    currentFilters = currentFilters;
  }
</script>

<div class="container">
  <header>
    <h1>Marcelle - Examples & Demos</h1>
  </header>
  <main>
    <div class="controls-container">
      <h2>Filter Demos</h2>
      <div class="controls">
        {#each filters as f, i}
          <div>
            <p>{f}</p>
            <Select
              items={filterValues[i]}
              isMulti={true}
              on:select={(e) => handleSelect(e.detail, i)}
            />
          </div>
        {/each}
      </div>
    </div>
    <div>
      <Masonry items={showDemos} {minColWidth} {maxColWidth} {gap} let:item bind:width bind:height>
        <Demo demo={item} />
      </Masonry>
    </div>
    <!-- <div class="demo-container">
      {#each showDemos as demo}
        <Demo {demo} />
      {/each}
    </div> -->
  </main>
  <div class="privacy">
    <strong>Privacy Notice:</strong> Cookies are necessary to run these demos. In these demos data is
    stored in your web browser. None of your input will be transfered to a remote server.
  </div>
  <footer>
    <a href="https://marcelle.dev">Back to marcelle.dev</a>
    © 2020 Marcelle Pirates Crew
  </footer>
</div>

<style>
  :global(html),
  :global(body) {
    font-family: 'Poppins', sans-serif;
    box-sizing: border-box;
    font-weight: 300;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }

  header {
    margin-top: 2rem;
  }

  .container {
    max-width: 100%;
    width: 940px;
    margin: auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100vh;
  }

  p {
    text-align: left;
    padding: 1rem 0;
    margin: 0 4rem;
  }

  .privacy {
    text-align: left;
    color: lightslategray;
    padding: 1rem 0;
    margin: 0 4rem;
    border-radius: 4px;
  }

  .controls-container {
    border-top: 2px solid lightsteelblue;
    border-bottom: 2px solid lightsteelblue;
    margin-top: 1rem;
    margin-bottom: 2rem;
  }

  .controls-container h2 {
    padding-bottom: 8px;
    font-size: 1.4rem;
    font-weight: 500;
    color: steelblue;
  }

  .controls {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .controls > div {
    margin: 0 0.25rem;
    width: 30%;
  }

  .controls > div > p {
    text-align: center;
    padding: 0;
  }

  footer {
    margin-top: 1rem;
    padding: 1rem;
    text-align: right;
    border-top: 1px solid rgb(237, 242, 247);
    color: #6a8bad;
    display: flex;
    justify-content: space-between;
  }
</style>
