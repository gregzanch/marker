import { Vec2, vec2 } from "../math/vec2";
import { Entity, type EntityOptions } from "./entity";
import { colors } from "../colors";
import { Ticker } from "../ticker";

export type CursorOptions = {
  visible: boolean;
  name: string;
  position: Vec2;
  size: number;
  color: (typeof colors)[number];
};

const ticker = new Ticker(colors.length - 1);

const defaultCursorOptions = () =>
  ({
    visible: true,
    name: "cursor",
    position: vec2(0, 0),
    size: 15,
    color: colors[ticker.increment()],
  } as CursorOptions);

export class Cursor extends Entity {
  public size: number;
  public color: (typeof colors)[number];
  constructor(
    context: CanvasRenderingContext2D,
    options: Partial<CursorOptions> = {}
  ) {
    const opts = { ...defaultCursorOptions(), ...options };
    super(context, opts);
    this.size = opts.size;
    this.color = opts.color;
  }
  draw() {
    if (!this.visible) return;
    this.context.strokeStyle = this.color;
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
