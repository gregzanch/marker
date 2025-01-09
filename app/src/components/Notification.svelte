<script lang="ts">
  import { fade } from "svelte/transition";

  type NotificationProps = {
    message: string;
    ondismiss: () => void;
  };
  let { message, ondismiss }: NotificationProps = $props();
</script>

<div class="notification" in:fade out:fade>
  <button class="dismiss-button" onclick={ondismiss} aria-label="close">
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L7 7M7 1L1 7"
        stroke="var(--mono-darker)"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
  {message}
</div>

<style>
  .notification {
    opacity: 1;
    border-radius: var(--input-radius-large);
    background-color: var(--mono-lighter);
    border-color: var(--mono-light);
    border-style: solid;
    border-width: 1px;
    box-sizing: border-box;
    box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.1);
    padding: var(--input-padding-vertical) var(--input-padding-horizontal);
  }

  button.dismiss-button {
    display: none;
    position: absolute;
    top: -0.5em;
    left: -0.5em;
    border-radius: 50%;
    padding: 4px;
    line-height: 0px;
    border-color: var(--mono-light);
  }

  .notification:hover {
    button.dismiss-button {
      display: initial;
    }
  }
</style>
