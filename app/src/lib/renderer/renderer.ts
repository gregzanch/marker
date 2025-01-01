import type { AppState } from "../../state/appState.svelte";
import { constructMessage } from "../../state/messenger.svelte";
import { Cursor } from "../entities/cursor";
import { Entity } from "../entities/entity";
import { throttle } from "../throttle";

export class Renderer {
  context: CanvasRenderingContext2D;
  entities: Entity[] = [];
  cursors: Map<string, Cursor> = new Map<string, Cursor>();
  appState: AppState;
  constructor(context: CanvasRenderingContext2D, appState: AppState) {
    this.context = context;
    this.appState = appState;
    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
  }

  draw() {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
    for (const entity of this.entities) {
      entity.draw();
    }
  }

  resize(event?: UIEvent) {
    this.context.canvas.width = window.innerWidth;
    this.context.canvas.height = window.innerHeight;
    this.adjustForPixelRatio();
    this.draw();
  }
  close() {
    window.removeEventListener("resize", this.resize);
  }
  adjustForPixelRatio() {
    this.context.canvas.setAttribute(
      "width",
      `${this.context.canvas.width * window.devicePixelRatio}px`
    );
    this.context.canvas.setAttribute(
      "height",
      `${this.context.canvas.height * window.devicePixelRatio}px`
    );
  }

  sendCursorChangeEvent = throttle(
    (name: string, id: string, x: number, y: number) => {
      this.appState.messenger?.connection?.send(
        constructMessage("cursor-change", {
          from: { name, id },
          data: { x, y },
        })
      );
    },
    50
  ).bind(this);

  mousemove(event: MouseEvent) {
    const bounds = this.context.canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.top) * window.devicePixelRatio;
    const y = (event.clientY - bounds.left) * window.devicePixelRatio;
    // set the position of our own cursor.
    this.cursors.get(this.appState.id)?.position.set(x, y);
    // send a message to everyone that our own cursor moved
    this.sendCursorChangeEvent(this.appState.name!, this.appState.id, x, y);
  }
  setupEventHandlers() {
    this.context.canvas.addEventListener("mousemove", this.mousemove);
    // define received cursor change event handler
    this.appState.messenger?.addEventListener("cursor-change", (event) => {
      this.cursors.get(event.from.id)?.position.set(event.data.x, event.data.y);
    });

    // define received user joined handler
    this.appState.messenger?.addEventListener("user-joined", (data) => {
      fetch("/getClients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: this.appState.boardId }),
      })
        .then((r) => r.json())
        .then((data) => {
          for (const client of data.clients as any[]) {
            if (this.appState.users.find((user) => user.id === client.id)) {
              continue;
            }
            this.appState.users.push(client);
            const c = new Cursor(this.context);
            c.color = client.color;
            this.cursors.set(client.id, c);
            this.addEntity(c);
          }
        })
        .catch(console.error);
    });
  }
  removeEventHandlers() {
    this.context.canvas.removeEventListener("mousemove", this.mousemove);
  }
}
