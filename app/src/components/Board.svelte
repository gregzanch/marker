<script lang="ts">
  import { onMount } from "svelte";
  import { appState } from "../state/appState.svelte";
  import { constructMessage, Messenger } from "../state/messenger.svelte";
  import { throttle } from "../lib/throttle";
  import { Renderer } from "../lib/renderer/renderer";
  import { Cursor } from "../lib/entities/cursor";
  import ConnectedUsers from "./ConnectedUsers.svelte";

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let width = $state(window.innerWidth);
  let height = $state(window.innerHeight);
  let renderer = $state<Renderer | null>(null);
  let dataLoaded = $state(false);

  console.log(appState);

  onMount(() => {
    
    const location = new URL(window.location.toString());
    const id = location.searchParams.get("id");
    if (!id) {
      appState.navigate("notFound");
      return;
    }
    if (!appState.name) {
      appState.navigate("join", { id });
      return;
    }
    appState.messenger = new Messenger(id);

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

    appState.messenger.connection?.addEventListener("open", () => {
      fetch("/getClients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id })
    }).then(r => r.json()).then((data) => {

      for(const client of data.clients as any[]) {
        appState.users.push(client);
        console.log(appState.users);
        cursors.get(appState.id)!.color = client.color;
        dataLoaded = true;
      }
    }).catch(console.error)
    })
    


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

  $inspect(appState.users).with(console.log)
</script>

<div class="page-container">
  <nav>
    <span class="marker-logo">marker</span>
    <ConnectedUsers />
  </nav>
  <canvas id="board" {width} {height}></canvas>
</div>

<style>
  .marker-logo {
    font-size: 36px;
    font-family: marker;
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
    align-items: center;
    justify-content: space-between;
  }
  canvas {
    width: 100vw;
    height: 100vh;
  }
</style>
