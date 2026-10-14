import { Shape } from "./Shape.js";

export class Rect extends Shape {
  public constructor(
    id: string,
    private x: number,
    private y: number,
    private width: number,
    private height: number,
    fill?: string,
  ) {
    super(id, fill);

    this.requireFinite(x, "x");
    this.requireFinite(y, "y");
    this.requirePositive(width, "width");
    this.requirePositive(height, "height");
  }

  public getType(): string {
    return "rect";
  }

  public move(dx: number, dy: number): void {
    this.requireFinite(dx, "dx");
    this.requireFinite(dy, "dy");

    this.x += dx;
    this.y += dy;
  }

  public scale(factor: number): void {
    this.requirePositive(factor, "scale factor");

    this.x *= factor;
    this.y *= factor;
    this.width *= factor;
    this.height *= factor;
  }

    public getAttribute(attribute: string): string | undefined {
    const commonValue = this.getCommonAttribute(attribute);

    if (commonValue !== null) {
      return commonValue;
    }

    if (attribute === "x") {
      return String(this.x);
    }

    if (attribute === "y") {
      return String(this.y);
    }

    if (attribute === "width") {
      return String(this.width);
    }

    if (attribute === "height") {
      return String(this.height);
    }

    throw new Error(`unknown attribute: ${attribute}`);
  }
  
  public setAttribute(attribute: string, value: string): void {
    if (this.setCommonAttribute(attribute, value)) {
      return;
    }

    if (attribute === "x") {
      this.x = this.parseFiniteValue(value, "x");
      return;
    }

    if (attribute === "y") {
      this.y = this.parseFiniteValue(value, "y");
      return;
    }

    if (attribute === "width") {
      this.width = this.parsePositiveValue(value, "width");
      return;
    }

    if (attribute === "height") {
      this.height = this.parsePositiveValue(value, "height");
      return;
    }

    throw new Error(`unknown attribute: ${attribute}`);
  }

  public toSvg(): string {
    return [
      `<rect id="${this.escapeXml(this.getId())}"`,
      `x="${this.x}"`,
      `y="${this.y}"`,
      `width="${this.width}"`,
      `height="${this.height}"${this.getSvgStyleAttributes()}/>`,
    ].join(" ");
  }

  public describe(): string {
    return [
      `rect#${this.getId()}`,
      `x=${this.x}`,
      `y=${this.y}`,
      `w=${this.width}`,
      `h=${this.height}${this.getStyleDescription()}`,
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