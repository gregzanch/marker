<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "./state/appState.svelte";
  import ErrorMessage from "./components/ErrorMessage.svelte";
  import Board from "./components/Board.svelte";
  import Home from "./components/Home.svelte";
  import type { ChangeEventHandler } from "svelte/elements";

  const isHomePage = document.location.pathname === "/";

</script>

{#if appState.globalErrorMessage}
  <ErrorMessage errorMessage={appState.globalErrorMessage} />
{:else if isHomePage}
  <Home />
{:else}
  <Board />
{/if}

<style type="text/css">

</style>
