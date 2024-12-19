<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "../state/appState.svelte";
  import { constructMessage } from "../state/messenger.svelte";
  import { throttle } from "../lib/throttle";
  import { Renderer } from "../lib/renderer/renderer";
  import { Cursor } from "../lib/entities/cursor";

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let width = $state(window.innerWidth);
  let height = $state(window.innerHeight);
  let renderer = $state<Renderer | null>(null);

  const throttledCursorChange = throttle((name: string, id: string, x: number, y: number) => {
    appState.messenger?.connection?.send(constructMessage("cursor-change", {
      from: {
        name,
        id,
      },
      data: {
        x, y
      }
    }))
  }, 100);
  
  function mousemove(event: MouseEvent) {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.top;
    const y = event.clientY - bounds.left;
    throttledCursorChange(appState.name, appState.id, x * window.devicePixelRatio, y * window.devicePixelRatio);
  }

  onMount(() => {
    canvas = document.getElementById("board") as HTMLCanvasElement;
    context = canvas.getContext("2d")!;
    if(!context) {
      appState.globalErrorMessage = "Failed to get canvas context."
    }
    renderer = new Renderer(context);
    Object.assign(window, {renderer});

    

    const cursor = new Cursor(context);
    renderer.addEntity(cursor);

    canvas.addEventListener("mousemove", mousemove);
    appState.messenger?.addEventListener("cursor-change", (data) => {
      console.log(data);
      const { data: {x, y}, from: {name, id} } = data;
      cursor.position.set(x,y);
    })

    const interval = setInterval(() => {
      requestAnimationFrame(() => {
        renderer?.draw()
      })
    }, 1000/60);

    return () => {
      canvas.removeEventListener("mousemove", mousemove);
      clearInterval(interval);
    }

  })
  
</script>

<canvas id="board" {width} {height}></canvas>

<style>
  canvas {
    width: 100vw;
    height: 100vh;
  }
</style>