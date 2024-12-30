<script lang="ts">
  import {appState} from "../state/appState.svelte";
</script>

<svelte:component this={appState.routes[appState.currentPage]} />