import { Vec2, vec2 } from "../math/vec2";
import { Entity, type EntityOptions } from "./entity";
import { colors } from "../colors";

export type LineOptions = {
  visible: boolean;
  name: string;
  position: Vec2;
  width: number;
  color: string;
  vertices: Array<{ x: number; y: number }>;
};

const defaultLineOptions = () =>
  ({
    visible: true,
    name: "line",
    position: vec2(0, 0),
    width: 15,
    color: "#000000",
    vertices: [],
  } as LineOptions);

export class Line extends Entity {
  public width: number;
  public color: string;
  public vertices: Array<{ x: number; y: number }>;
  constructor(
    context: CanvasRenderingContext2D,
    options: Partial<LineOptions> = {}
  ) {
    const opts = { ...defaultLineOptions(), ...options };
    super(context, opts);
    this.width = opts.width;
    this.color = opts.color;
    this.vertices = opts.vertices;
  }
  draw() {
    if (!this.visible) return;
    if (this.vertices.length === 0) return;
    this.context.save();
    this.context.lineCap = "round";
    this.context.strokeStyle = this.color;
    this.context.lineWidth = this.width;
    this.context.beginPath();
    this.context.moveTo(this.vertices[0].x, this.vertices[0].y);
    for (const { x, y } of this.vertices.slice(1)) {
      this.context.lineTo(x, y);
    }
    this.context.stroke();
    this.context.restore();
  }
}
