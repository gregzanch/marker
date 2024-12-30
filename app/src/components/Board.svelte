<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "../state/appState.svelte";
  import { constructMessage, Messenger } from "../state/messenger.svelte";
  import { throttle } from "../lib/throttle";
  import { Renderer } from "../lib/renderer/renderer";
  import { Cursor } from "../lib/entities/cursor";

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let width = $state(window.innerWidth);
  let height = $state(window.innerHeight);
  let renderer = $state<Renderer | null>(null);

  onMount(() => {
    const location = new URL(window.location.toString());
    const id = location.searchParams.get("id");
    if (!id) {
      appState.navigate("notFound");
      return;
    }
    appState.messenger = new Messenger(id);
    if (!appState.name) {
      appState.navigate("join", { id });
      return;
    }

    canvas = document.getElementById("board") as HTMLCanvasElement;
    context = canvas.getContext("2d")!;
    if (!context) {
      appState.globalErrorMessage = "Failed to get canvas context.";
    }
    renderer = new Renderer(context);

    const cursors = new Map<string, Cursor>([
      [appState.id, new Cursor(context)],
    ]);
    Object.assign(window, { renderer, cursors });
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
      50
    );

    function mousemove(event: MouseEvent) {
      const bounds = canvas.getBoundingClientRect();
      const x = (event.clientX - bounds.top) * window.devicePixelRatio;
      const y = (event.clientY - bounds.left) * window.devicePixelRatio;
      // set the position of our own cursor.
      cursors.get(appState.id)?.position.set(x, y);
      // send a message to everyone that our own cursor moved
      throttledCursorChange(appState.name!, appState.id, x, y);
    }

    canvas.addEventListener("mousemove", mousemove);
    appState.messenger?.addEventListener("cursor-change", (data) => {
      const {
        data: { x, y },
        from: { name, id },
      } = data;
      // if (id === appState.id) return;
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
