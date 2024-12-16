import { Entity } from "../entities/entity";

export class Renderer {
  context: CanvasRenderingContext2D;
  entities: Entity[] = [];
  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
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
}
