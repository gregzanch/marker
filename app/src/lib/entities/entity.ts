import { vec2, type Vec2 } from "../math/vec2";

export type EntityOptions = {
  visible: boolean;
  name: string;
  position: Vec2;
};

const defaultEntityOptions = () =>
  ({
    visible: true,
    name: "entity",
    position: vec2(0, 0),
  } as EntityOptions);

export class Entity {
  public visible: boolean;
  public name: string;
  public children: Entity[] = [];
  public context: CanvasRenderingContext2D;
  public position: Vec2;
  constructor(
    context: CanvasRenderingContext2D,
    options: Partial<EntityOptions> = {}
  ) {
    const { name, visible, position } = {
      ...defaultEntityOptions(),
      ...options,
    };
    this.name = name;
    this.visible = visible;
    this.position = position;
    this.context = context;
  }
  draw() {
    if (!this.visible) return;
    for (const child of this.children) {
      child.draw();
    }
  }
}
