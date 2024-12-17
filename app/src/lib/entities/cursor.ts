import { Vec2, vec2 } from "../math/vec2";
import { Entity, type EntityOptions } from "./entity";

export type CursorOptions = {
  visible: boolean;
  name: string;
  position: Vec2;
  size: number;
};

const defaultCursorOptions: CursorOptions = {
  visible: true,
  name: "cursor",
  position: vec2(0, 0),
  size: 5,
};

export class Cursor extends Entity {
  public size: number;
  constructor(
    context: CanvasRenderingContext2D,
    options: Partial<CursorOptions> = {}
  ) {
    const opts = { ...defaultCursorOptions, ...options };
    super(context, opts);
    this.size = opts.size;
  }
  draw() {
    if (!this.visible) return;
    this.context.strokeStyle = "#000000aa";
    this.context.beginPath();
    this.context.moveTo(this.position.x, this.position.y);
    this.context.lineTo(this.position.x, this.position.y + this.size);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(this.position.x, this.position.y);
    this.context.lineTo(this.position.x, this.position.y - this.size);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(this.position.x, this.position.y);
    this.context.lineTo(this.position.x + this.size, this.position.y);
    this.context.stroke();

    this.context.beginPath();
    this.context.moveTo(this.position.x, this.position.y);
    this.context.lineTo(this.position.x - this.size, this.position.y);
    this.context.stroke();
  }
}
