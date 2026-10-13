import { Shape } from "./Shape.js";

export class Line extends Shape {
  public constructor(
    id: string,
    private x1: number,
    private y1: number,
    private x2: number,
    private y2: number,
    stroke?: string,
  ) {
    super(id);

    this.requireFinite(x1, "x1");
    this.requireFinite(y1, "y1");
    this.requireFinite(x2, "x2");
    this.requireFinite(y2, "y2");

    if (stroke !== undefined) {
      this.setCommonAttribute("stroke", stroke);
    }
  }

  public getType(): string {
    return "line";
  }

  public move(dx: number, dy: number): void {
    this.requireFinite(dx, "dx");
    this.requireFinite(dy, "dy");

    this.x1 += dx;
    this.y1 += dy;
    this.x2 += dx;
    this.y2 += dy;
  }

  public scale(factor: number): void {
    this.requirePositive(factor, "scale factor");

    this.x1 *= factor;
    this.y1 *= factor;
    this.x2 *= factor;
    this.y2 *= factor;
  }

  public setAttribute(attribute: string, value: string): void {
    if (this.setCommonAttribute(attribute, value)) {
      return;
    }

    if (attribute === "x1") {
      this.x1 = this.parseFiniteValue(value, "x1");
      return;
    }

    if (attribute === "y1") {
      this.y1 = this.parseFiniteValue(value, "y1");
      return;
    }

    if (attribute === "x2") {
      this.x2 = this.parseFiniteValue(value, "x2");
      return;
    }

    if (attribute === "y2") {
      this.y2 = this.parseFiniteValue(value, "y2");
      return;
    }

    throw new Error(`unknown attribute: ${attribute}`);
  }

  public toSvg(): string {
    return [
      `<line id="${this.escapeXml(this.getId())}"`,
      `x1="${this.x1}"`,
      `y1="${this.y1}"`,
      `x2="${this.x2}"`,
      `y2="${this.y2}"${this.getSvgStyleAttributes()}/>`,
    ].join(" ");
  }

  public describe(): string {
    return [
      `line#${this.getId()}`,
      `(${this.x1},${this.y1})`,
      "->",
      `(${this.x2},${this.y2})${this.getStyleDescription()}`,
    ].join(" ");
  }

  private parseFiniteValue(value: string, name: string): number {
    const parsed = Number(value);
    this.requireFinite(parsed, name);
    return parsed;
  }
}