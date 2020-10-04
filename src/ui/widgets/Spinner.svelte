<style lang="postcss">
  .spinner-container {
    /* position: absolute;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    bottom: 0;
    width: 100%; */
    min-height: 40px;
    @apply absolute flex flex-no-wrap items-center justify-center inset-0 w-full bg-white bg-opacity-50;
  }

  .spinner {
    margin: 30px auto;
    width: 40px;
    height: 40px;
    position: relative;
    text-align: center;
    -webkit-animation: sk-rotate 2s infinite linear;
    animation: sk-rotate 2s infinite linear;
  }

  .dot1,
  .dot2 {
    @apply bg-indigo-500;
    width: 60%;
    height: 60%;
    display: inline-block;
    position: absolute;
    top: 0;
    border-radius: 100%;
    -webkit-animation: sk-bounce 2s infinite ease-in-out;
    animation: sk-bounce 2s infinite ease-in-out;
  }

  .dot2 {
    top: auto;
    bottom: 0;
    -webkit-animation-delay: -1s;
    animation-delay: -1s;
  }

  @-webkit-keyframes sk-rotate {
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes sk-rotate {
    100% {
      transform: rotate(360deg);
      -webkit-transform: rotate(360deg);
    }
  }

  @-webkit-keyframes sk-bounce {
    0%,
    100% {
      -webkit-transform: scale(0);
    }
    50% {
      -webkit-transform: scale(1);
    }
  }

  @keyframes sk-bounce {
    0%,
    100% {
      transform: scale(0);
      -webkit-transform: scale(0);
    }
    50% {
      transform: scale(1);
      -webkit-transform: scale(1);
    }
  }
</style>

<span class="spinner-container">
  <span class="spinner"> <span class="dot1" /> <span class="dot2" /> </span>
</span>
