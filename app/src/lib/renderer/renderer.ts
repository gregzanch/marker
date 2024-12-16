export class Renderer {
  context: CanvasRenderingContext2D;
  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
    this.resize();
  }
  resize(event?: UIEvent) {
    this.context.canvas.width = window.innerWidth;
    this.context.canvas.height = window.innerHeight;
    this.adjustForPixelRatio();
  }
  close() {
    window.removeEventListener("resize", this.resize);
  }
  draw() {
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
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
