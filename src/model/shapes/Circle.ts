import { Shape } from "./Shape.js";

export class Circle extends Shape {
  public constructor(
    id: string,
    private cx: number,
    private cy: number,
    private radius: number,
    fill?: string,
  ) {
    super(id, fill);

    this.requireFinite(cx, "cx");
    this.requireFinite(cy, "cy");
    this.requirePositive(radius, "r");
  }

  public getType(): string {
    return "circle";
  }

  public move(dx: number, dy: number): void {
    this.requireFinite(dx, "dx");
    this.requireFinite(dy, "dy");

    this.cx += dx;
    this.cy += dy;
  }

  public scale(factor: number): void {
    this.requirePositive(factor, "scale factor");

    this.cx *= factor;
    this.cy *= factor;
    this.radius *= factor;
  }

  public setAttribute(attribute: string, value: string): void {
    if (this.setCommonAttribute(attribute, value)) {
      return;
    }

    if (attribute === "cx") {
      this.cx = this.parseFiniteValue(value, "cx");
      return;
    }

    if (attribute === "cy") {
      this.cy = this.parseFiniteValue(value, "cy");
      return;
    }

    if (attribute === "r") {
      this.radius = this.parsePositiveValue(value, "r");
      return;
    }

    throw new Error(`unknown attribute: ${attribute}`);
  }

  public toSvg(): string {
    return [
      `<circle id="${this.escapeXml(this.getId())}"`,
      `cx="${this.cx}"`,
      `cy="${this.cy}"`,
      `r="${this.radius}"${this.getSvgStyleAttributes()}/>`,
    ].join(" ");
  }

  public describe(): string {
    return [
      `circle#${this.getId()}`,
      `cx=${this.cx}`,
      `cy=${this.cy}`,
      `r=${this.radius}${this.getStyleDescription()}`,
    ].join(" ");
  }

  private parseFiniteValue(value: string, name: string): number {
    const parsed = Number(value);
    this.requireFinite(parsed, name);
    return parsed;
  }

  private parsePositiveValue(value: string, name: string): number {
    const parsed = Number(value);
    this.requirePositive(parsed, name);
    return parsed;
  }
}