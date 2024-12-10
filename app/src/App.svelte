<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "./state/appState.svelte";
  import ErrorMessage from "./components/ErrorMessage.svelte"
  import type { ChangeEventHandler } from "svelte/elements";
  let errorMessage = $state<string | null>(null)
  let messages = $state<string[]>([])
  let message = $state("")

  function onsubmit(event: SubmitEvent) {
    event.preventDefault();
    if (!appState.connection || !message) return false;
    appState.connection.send(message);
    message = "";
    return false;
  }

  const onchange: ChangeEventHandler<HTMLInputElement> = (event) => {
    message = event.currentTarget?.value
  }

  onMount(() => {
    if (!window["WebSocket"]) {
      errorMessage = "Your browser does not support WebSockets."
      return;
    }
    appState.connection = new WebSocket("ws://" + document.location.host + "/ws");
    appState.connection.addEventListener("close", () => {
      errorMessage = "Connection closed."
    })
    appState.connection.addEventListener("message", (event: MessageEvent) => {
      const incommingMessages = event.data.split("\n");
      for(const messageText of incommingMessages) {
        messages = [...messages, messageText]
      }
    })
  })

</script>

{#if errorMessage}
  <ErrorMessage {errorMessage} />
{:else}
  <div id="log">
    {#each messages as m}
      <p>{m}</p>
    {/each}
  </div>
  <form {onsubmit}>
    <input type="submit" value="Send" />
    <input type="text" size="64" value={message} {onchange} />
  </form>
{/if}

<style type="text/css">

</style>
