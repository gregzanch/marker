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

  onMount(() => {
    const userName = localStorage?.getItem("userName");
    if (userName) {
      appState.name = userName;
    }
    canvas = document.getElementById("board") as HTMLCanvasElement;
    context = canvas.getContext("2d")!;
    if (!context) {
      appState.globalErrorMessage = "Failed to get canvas context.";
    }
    renderer = new Renderer(context);
    Object.assign(window, { renderer });

    const cursors = new Map<string, Cursor>([
      [appState.id, new Cursor(context)],
    ]);
    renderer.addEntity(cursors.get(appState.id)!);

    const throttledCursorChange = throttle(
      (name: string, id: string, x: number, y: number) => {
        appState.messenger?.connection?.send(
          constructMessage("cursor-change", {
            from: {
              name,
              id,
            },
            data: {
              x,
              y,
            },
          })
        );
      },
      100
    );

    function mousemove(event: MouseEvent) {
      const bounds = canvas.getBoundingClientRect();
      const x = (event.clientX - bounds.top) * window.devicePixelRatio;
      const y = (event.clientY - bounds.left) * window.devicePixelRatio;
      // set the position of our own cursor.
      cursors.get(appState.id)?.position.set(x, y);
      // send a message to everyone that our own cursor moved
      throttledCursorChange(
        appState.name,
        appState.id,
        x,
        y
      );
    }

    canvas.addEventListener("mousemove", mousemove);
    appState.messenger?.addEventListener("cursor-change", (data) => {
      const {
        data: { x, y },
        from: { name, id },
      } = data;
      console.log(renderer, id);
      if (id === appState.id) return;
      if (!cursors.has(id)) {
        cursors.set(id, new Cursor(context));
        renderer?.addEntity(cursors.get(id)!);
      }
      cursors.get(id)!.position.set(x, y);
    });

    const interval = setInterval(() => {
      requestAnimationFrame(() => {
        renderer?.draw();
      });
    }, 1000 / 60);

    return () => {
      canvas.removeEventListener("mousemove", mousemove);
      clearInterval(interval);
    };
  });
</script>

<canvas id="board" {width} {height}></canvas>

<style>
  canvas {
    width: 100vw;
    height: 100vh;
  }
</style>
