export class Vec2 {
  x: number = 0;
  y: number = 0;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number): Vec2;
  set(x: Vec2): Vec2;
  set(x: number | Vec2, y?: number): Vec2 {
    if (x instanceof Vec2) {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x;
      if (y == undefined) {
        this.y = x;
      } else {
        this.y = y;
      }
    }
    return this;
  }
  add(v: Vec2) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }
  sub(v: Vec2) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mul(v: Vec2) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }
  dot(v: Vec2) {
    return this.x * v.x + this.y * v.y;
  }
  mag() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  norm() {
    return this.clone().mulScalar(1 / this.mag());
  }
  mulScalar(v: number) {
    this.x *= v;
    this.y *= v;
    return this;
  }
  distanceTo(v: Vec2) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }
}

export function vec2(x: number, y: number) {
  return new Vec2(x, y);
}
