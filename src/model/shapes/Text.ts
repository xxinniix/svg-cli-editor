import { Shape } from "./Shape.js";

export class Text extends Shape {
  public constructor(
    id: string,
    private x: number,
    private y: number,
    private content: string,
    fill?: string,
  ) {
    super(id, fill);

    this.requireFinite(x, "x");
    this.requireFinite(y, "y");
  }

  public getType(): string {
    return "text";
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

    if (attribute === "text") {
      this.content = value;
      return;
    }

    throw new Error(`unknown attribute: ${attribute}`);
  }

  public toSvg(): string {
    return `<text id="${this.escapeXml(this.getId())}" x="${this.x}" y="${this.y}"${this.getSvgStyleAttributes()}>${this.escapeXml(this.content)}</text>`;
  }

  public describe(): string {
    return [
      `text#${this.getId()}`,
      `(${this.x},${this.y})`,
      `"${this.content}"${this.getStyleDescription()}`,
    ].join(" ");
  }

  private parseFiniteValue(value: string, name: string): number {
    const parsed = Number(value);
    this.requireFinite(parsed, name);
    return parsed;
  }
}