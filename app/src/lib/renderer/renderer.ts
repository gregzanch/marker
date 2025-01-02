import type { AppState } from "../../state/appState.svelte";
import { constructMessage, type From } from "../../state/messenger.svelte";
import { getClients, getCurrentBoardState } from "../api";
import { Cursor } from "../entities/cursor";
import { Entity } from "../entities/entity";
import { Line } from "../entities/line";
import { throttle } from "../throttle";

export class Renderer {
  context: CanvasRenderingContext2D;
  entities: Entity[] = [];
  cursors: Map<string, Cursor> = new Map<string, Cursor>();
  appState: AppState;
  isMouseDown: boolean = false;
  currentLine: Line | null = null;
  savePoint: number | null = null;
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

  sendCreateNewLineEvent = throttle(
    (
      from: From,
      id: string,
      color: string,
      vertices: { x: number; y: number }[]
    ) => {
      this.appState.messenger?.connection?.send(
        constructMessage("create-new-line", {
          from,
          data: { id, color, vertices },
        })
      );
    },
    50
  );

  sendAddPointsToLineEvent = throttle(
    (from: From, id: string, vertices: { x: number; y: number }[]) => {
      this.appState.messenger?.connection?.send(
        constructMessage("add-points-to-line", {
          from,
          data: {
            id,
            vertices,
          },
        })
      );
      this.saveVertexPoint();
    },
    50
  );

  saveVertexPoint() {
    if (this.currentLine) {
      this.savePoint = this.currentLine.vertices.length;
    } else {
      this.savePoint = null;
    }
  }

  mousemove = (event: MouseEvent) => {
    const bounds = this.context.canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.top) * window.devicePixelRatio;
    const y = (event.clientY - bounds.left) * window.devicePixelRatio;
    // set the position of our own cursor.
    this.cursors.get(this.appState.id)?.position.set(x, y);
    // send a message to everyone that our own cursor moved
    this.sendCursorChangeEvent(this.appState.name!, this.appState.id, x, y);
    if (this.isMouseDown && this.currentLine) {
      // then we're drawing
      this.currentLine.vertices.push({ x, y });
      this.sendAddPointsToLineEvent(
        {
          id: this.appState.id,
          name: this.appState.name!,
        },
        this.currentLine.id,
        this.currentLine?.vertices.slice(this.savePoint || 0) || []
      );
    }
  };

  mousedown = (event: MouseEvent) => {
    this.isMouseDown = true;
    const bounds = this.context.canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.top) * window.devicePixelRatio;
    const y = (event.clientY - bounds.left) * window.devicePixelRatio;
    const line = new Line(this.context, { vertices: [{ x, y }] });
    this.currentLine = line;
    this.addEntity(line);
    this.savePoint = 0;
    this.sendCreateNewLineEvent(
      { id: this.appState.id, name: this.appState.name! },
      line.id,
      line.color,
      line.vertices
    );
  };

  mouseup = (event: MouseEvent) => {
    this.isMouseDown = false;
    this.currentLine = null;
  };

  setupEventHandlers() {
    this.context.canvas.addEventListener("mousemove", this.mousemove);
    this.context.canvas.addEventListener("mousedown", this.mousedown);
    window.addEventListener("mouseup", this.mouseup);

    // define received cursor change event handler
    this.appState.messenger?.addEventListener("cursor-change", (event) => {
      this.cursors.get(event.from.id)?.position.set(event.data.x, event.data.y);
    });

    this.appState.messenger?.addEventListener("create-new-line", (event) => {
      if (event.from.id === this.appState.id) return;
      const line = new Line(this.context);
      line.id = event.data.id;
      line.vertices.push(...event.data.vertices);
      this.addEntity(line);
    });

    this.appState.messenger?.addEventListener("add-points-to-line", (event) => {
      if (event.from.id === this.appState.id) return;
      const line = this.entities.find(
        (value) => value.id === event.data.id
      ) as Line;
      if (!line) {
        return;
      }
      line.vertices.push(...event.data.vertices);
    });

    // define received user joined handler
    this.appState.messenger?.addEventListener("user-joined", async (data) => {
      if (!this.appState.boardId) {
        console.error("Could not get board id");
        return;
      }
      const { clients, lines } = await getCurrentBoardState(
        this.appState.boardId
      );
      // console.log(lines);
      for (const client of clients) {
        if (this.appState.users.find((user) => user.id === client.id)) {
          continue;
        }
        this.appState.users.push(client);
        const c = new Cursor(this.context);
        c.position.set(client.position.x, client.position.y);
        c.color = client.color;
        this.cursors.set(client.id, c);
        this.addEntity(c);
      }
      if (data.from.id === this.appState.id) {
        for (const line of lines) {
          const l = new Line(this.context, {
            color: line.color,
            vertices: line.vertices,
          });
          this.addEntity(l);
        }
      }
    });
  }
  removeEventHandlers() {
    this.context.canvas.removeEventListener("mousemove", this.mousemove);
    this.context.canvas.removeEventListener("mousedown", this.mousedown);
    window.removeEventListener("mouseup", this.mouseup);
  }
}
