<script lang="ts">
  // Import styles.
  import 'vidstack/player/styles/default/theme.css';
  import 'vidstack/player/styles/default/layouts/audio.css';
  import 'vidstack/player/styles/default/layouts/video.css';
  // Register elements.
  import 'vidstack/player';
  import 'vidstack/player/layouts';
  import 'vidstack/player/ui';

  import { onMount } from 'svelte';
  import { isHLSProvider, type MediaCanPlayEvent, type MediaProviderChangeEvent } from 'vidstack';
  import type { MediaPlayerElement } from 'vidstack/elements';

  import { ViewContainer } from '@marcellejs/design-system';
  import type { Stream } from '../../core';
  export let title: string;
  export let src: Stream<string>;
  // export let ready: Stream<boolean>;
  export let paused: Stream<boolean>;
  export let progress: Stream<number>;
  export let mirror: Stream<boolean>;

  // import { textTracks } from './tracks';

  let player: MediaPlayerElement;

  let allowProgressControl = true;
  onMount(() => {
    /**
     * You can add these tracks using HTML as well.
     *
     * @example
     * ```html
     * <media-provider>
     *   <track label="..." src="..." kind="..." srclang="..." default />
     *   <track label="..." src="..." kind="..." srclang="..." />
     * </media-provider>
     * ```
     */
    // for (const track of textTracks) player.textTracks.add(track);

    progress.subscribe((p) => {
      if (allowProgressControl && player) {
        player.currentTime = p;
      }
    });

    // Subscribe to state updates.
    return player.subscribe((state) => {
      if (state.paused !== paused.get()) {
        paused.set(state.paused);
      }
      allowProgressControl = false;
      progress.set(state.currentTime);
      allowProgressControl = true;
    });
  });

  function onProviderChange(event: MediaProviderChangeEvent) {
    const provider = event.detail;
    // We can configure provider's here.
    if (isHLSProvider(provider)) {
      provider.config = {};
    }
  }

  // We can listen for the `can-play` event to be notified when the player is ready.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onCanPlay(event: MediaCanPlayEvent) {
    // ...
  }
</script>

<ViewContainer {title}>
  <!-- <video
    src={$src}
    width="480"
    controls
    bind:this={videoElt}
    bind:currentTime={$progress}
    bind:paused={$paused}
  /> -->
  <media-player
    class="player"
    {title}
    src={$src || ''}
    crossorigin
    on:provider-change={onProviderChange}
    on:can-play={onCanPlay}
    bind:this={player}
    paused={$paused}
  >
    <media-provider style={$mirror ? 'transform: scaleX(-1)' : ''}>
      <!-- <media-poster
        class="vds-poster"
        src="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/thumbnail.webp?time=268&width=1200"
        alt="Girl walks into campfire with gnomes surrounding her friend ready for their next meal!"
      /> -->
    </media-provider>
    <!-- Layouts -->
    <media-audio-layout />
    <media-video-layout />
  </media-player>
</ViewContainer>

<style lang="postcss">
  .player {
    --brand-color: #f5f5f5;
    --focus-color: #4e9cf6;

    --audio-brand: var(--brand-color);
    --audio-focus-ring-color: var(--focus-color);
    --audio-border-radius: 2px;

    --video-brand: var(--brand-color);
    --video-focus-ring-color: var(--focus-color);
    --video-border-radius: 2px;

    /* 👉 https://vidstack.io/docs/player/components/layouts/default#css-variables for more. */

    max-width: 640px;

    &[data-view-type='audio'] media-poster {
      display: none;
    }

    &[data-view-type='video'] {
      aspect-ratio: 16 /9;
    }
  }
</style>
