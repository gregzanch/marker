<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "./state/appState.svelte";
  import ErrorMessage from "./components/ErrorMessage.svelte"
  import Board from "./components/Board.svelte"
  import type { ChangeEventHandler } from "svelte/elements";

</script>

{#if appState.globalErrorMessage}
  <ErrorMessage errorMessage={appState.globalErrorMessage} />
{:else}
  <Board />
{/if}

<style type="text/css">

</style>
