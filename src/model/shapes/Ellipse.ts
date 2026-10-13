import { Shape } from "./Shape.js";

export class Ellipse extends Shape {
  public constructor(
    id: string,
    private cx: number,
    private cy: number,
    private rx: number,
    private ry: number,
    fill?: string,
  ) {
    super(id, fill);

    this.requireFinite(cx, "cx");
    this.requireFinite(cy, "cy");
    this.requirePositive(rx, "rx");
    this.requirePositive(ry, "ry");
  }

  public getType(): string {
    return "ellipse";
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
    this.rx *= factor;
    this.ry *= factor;
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

    if (attribute === "rx") {
      this.rx = this.parsePositiveValue(value, "rx");
      return;
    }

    if (attribute === "ry") {
      this.ry = this.parsePositiveValue(value, "ry");
      return;
    }

    throw new Error(`unknown attribute: ${attribute}`);
  }

  public toSvg(): string {
    return [
      `<ellipse id="${this.escapeXml(this.getId())}"`,
      `cx="${this.cx}"`,
      `cy="${this.cy}"`,
      `rx="${this.rx}"`,
      `ry="${this.ry}"${this.getSvgStyleAttributes()}/>`,
    ].join(" ");
  }

  public describe(): string {
    return [
      `ellipse#${this.getId()}`,
      `cx=${this.cx}`,
      `cy=${this.cy}`,
      `rx=${this.rx}`,
      `ry=${this.ry}${this.getStyleDescription()}`,
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