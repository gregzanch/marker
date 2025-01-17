<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "../state/appState.svelte";
  import { constructMessage, Messenger } from "../state/messenger.svelte";
  import { throttle } from "../lib/throttle";
  import { Renderer } from "../lib/renderer/renderer";
  import { Cursor } from "../lib/entities/cursor";
  import ConnectedUsers from "./ConnectedUsers.svelte";
  import { Line } from "../lib/entities/line";
  import { notify } from "./notify.svelte";

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let width = $state(window.innerWidth);
  let height = $state(window.innerHeight);
  let renderer = $state<Renderer | null>(null);
  let dataLoaded = $state(false);

  onMount(() => {

    // get board id 
    const location = new URL(window.location.toString());
    const id = location.searchParams.get("id");
    if (!id) {
      appState.fatalError("Could not parse room id from url.")
      return;
    }
    appState.boardId = id;

    // Redirect to join if no nane
    if (!appState.name) {
      appState.navigate("join", { id });
      return;
    }

    // initialize messenger
    appState.messenger = new Messenger(id);

    // get canvas context and init renderer
    canvas = document.getElementById("board") as HTMLCanvasElement;
    context = canvas.getContext("2d")!;
    if (!context) {
      appState.fatalError("Failed to get canvas context.")
      return;
    }
    
    // once renderer has the context, we can really do all the logic there
    renderer = new Renderer(context, appState);
    Object.assign(window, {renderer, appState})
    renderer.setupEventHandlers();

    const interval = setInterval(() => {
      requestAnimationFrame(() => {
        renderer?.draw();
      });
    }, 1000 / 60);

    return () => {
      renderer?.removeEventHandlers();
      clearInterval(interval);
    };
  });

  function copyLink(){
    navigator.clipboard.writeText(window.location.toString());
    notify("Copied link to clip to clipboard", 2)
  }
</script>

<div class="page-container">
  <nav>
    <div class="logo-container">
      <span class="marker-logo">marker</span>
      <p>{appState.boardName}</p>
    </div>
    <div class="right-container">
      <ConnectedUsers />
      <button id="share-button" onclick={copyLink}>Share</button>
    </div>
  </nav>
  <canvas id="board" {width} {height}></canvas>
</div>

<style>
  .right-container {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-300);
    align-items: center;
    margin-top: 0.5em;
    height: min-content;
  }
  .right-container > #share-button {
    height: min-content;
  }
  .logo-container > p {
    margin: 0;
    line-height: 1em;
  }
  .logo-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-200);
  }
  .marker-logo {
    font-size: 36px;
    font-family: marker;
    line-height: 1em;
  }
  .page-container {
    width: 100vw;
    height: 100vh;
    align-content: center;
  }
  nav {
    position: absolute;
    top: 0px;
    left: 0px;
    padding: var(--spacing-200) var(--spacing-600);
    width: calc(100vw - var(--spacing-600) * 2);
    display: flex;
    justify-content: space-between;
  }
  canvas {
    width: 100vw;
    height: 100vh;
  }
</style>
