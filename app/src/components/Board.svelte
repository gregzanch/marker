<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "../state/appState.svelte";
  import { constructMessage } from "../state/messenger.svelte";
  import { throttle } from "../lib/throttle";
  import { Renderer } from "../lib/renderer/renderer";

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let width = $state(window.innerWidth);
  let height = $state(window.innerHeight);
  let renderer = $state<Renderer | null>(null);

  const throttledCursorChange = throttle((from: string, x: number, y: number) => {
    appState.messenger?.connection?.send(constructMessage("cursor-change", {
      from,
      data: {
        x, y
      }
    }))
  }, 100);
  
  function mousemove(event: MouseEvent) {
    const bounds = canvas.getBoundingClientRect();
    const x = event.clientX - bounds.top;
    const y = event.clientY - bounds.left;
    throttledCursorChange(appState.user, x * window.devicePixelRatio, y * window.devicePixelRatio);
  }

  function drawEllipse(x:number ,y: number) {
    context.beginPath();
    context.ellipse(x,y,5,5,0,0,2*Math.PI);
    context.fillStyle = "#000000";
    context.fill();
  }

  onMount(() => {
    canvas = document.getElementById("board") as HTMLCanvasElement;
    context = canvas.getContext("2d")!;
    if(!context) {
      appState.globalErrorMessage = "Failed to get canvas context."
    }
    renderer = new Renderer(context);
    Object.assign(window, {renderer});
    canvas.addEventListener("mousemove", mousemove);
    appState.messenger?.addEventListener("cursor-change", (data) => {
      const { x,y } = data.data;
      drawEllipse(x,y);
    })

    return () => {
      canvas.removeEventListener("mousemove", mousemove);
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