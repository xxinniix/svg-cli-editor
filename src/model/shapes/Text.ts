import { Shape } from "./Shape.js";

export class Text extends Shape {
  private textAnchor: string | undefined;
  private fontSize: number | undefined;

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

  public getAttribute(attribute: string): string | undefined {
    const commonValue = this.getCommonAttribute(attribute);

    if (commonValue !== null) {
      return commonValue;
    }

    if (attribute === "x") {
      return this.formatNumber(this.x);
    }

    if (attribute === "y") {
      return this.formatNumber(this.y);
    }

    if (attribute === "text") {
      return this.content;
    }

    if (attribute === "text-anchor") {
      return this.textAnchor;
    }

    if (attribute === "font-size") {
      return this.fontSize === undefined
        ? undefined
        : this.formatNumber(this.fontSize);
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

    if (attribute === "text") {
      this.content = value;
      return;
    }

    if (attribute === "text-anchor") {
      if (value.trim() === "") {
        throw new Error("text-anchor must not be empty");
      }

      this.textAnchor = value;
      return;
    }

    if (attribute === "font-size") {
      const parsed = Number(value);
      this.requirePositive(parsed, "font-size");
      this.fontSize = parsed;
      return;
    }

    throw new Error(`unknown attribute: ${attribute}`);
  }

  public toSvg(): string {
    const typography = [
      this.textAnchor === undefined
        ? ""
        : ` text-anchor="${this.escapeXml(this.textAnchor)}"`,
      this.fontSize === undefined
        ? ""
        : ` font-size="${this.formatNumber(this.fontSize)}"`,
    ].join("");

    return `<text id="${this.escapeXml(this.getId())}" x="${this.formatNumber(this.x)}" y="${this.formatNumber(this.y)}"${typography}${this.getSvgStyleAttributes()}>${this.escapeXml(this.content)}</text>`;
  }

  public describe(): string {
    return [
      `text#${this.getId()}`,
      `(${this.formatNumber(this.x)},${this.formatNumber(this.y)})`,
      `"${this.content}"${this.getTypographyDescription()}${this.getStyleDescription()}`,
    ].join(" ");
  }

  private parseFiniteValue(value: string, name: string): number {
    const parsed = Number(value);
    this.requireFinite(parsed, name);
    return parsed;
  }

  public override restoreAttribute(
    attribute: string,
    value: string | undefined,
  ): void {
    if (attribute === "text-anchor") {
      this.textAnchor = value;
      return;
    }

    if (attribute === "font-size") {
      if (value === undefined) {
        this.fontSize = undefined;
        return;
      }

      const parsed = Number(value);
      this.requirePositive(parsed, "font-size");
      this.fontSize = parsed;
      return;
    }

    super.restoreAttribute(attribute, value);
  }

  private getTypographyDescription(): string {
    const descriptions: string[] = [];

    if (this.textAnchor !== undefined) {
      descriptions.push(`text-anchor=${this.textAnchor}`);
    }

    if (this.fontSize !== undefined) {
      descriptions.push(`font-size=${this.formatNumber(this.fontSize)}`);
    }

    return descriptions.length === 0 ? "" : ` ${descriptions.join(" ")}`;
  }
}
