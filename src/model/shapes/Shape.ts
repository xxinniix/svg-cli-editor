import type { Group } from "./Group.js";

export abstract class Shape {
  private fill: string | undefined;
  private stroke: string | undefined;
  private strokeWidth: number | undefined;
  private parent: Group | null = null;

  protected constructor(
    private readonly id: string,
    fill?: string,
  ) {
    if (id.trim() === "") {
      throw new Error("id must not be empty");
    }

    this.fill = fill;
  }

  public getId(): string {
    return this.id;
  }

  public getParent(): Group | null {
    return this.parent;
  }

  public setParent(parent: Group | null): void {
    this.parent = parent;
  }

  public abstract getType(): string;

  public abstract move(dx: number, dy: number): void;

  public abstract scale(factor: number): void;

  public abstract getAttribute(attribute: string): string | undefined;

  public abstract setAttribute(attribute: string, value: string): void;

  public restoreAttribute(attribute: string, value: string | undefined): void {
    if (this.restoreCommonAttribute(attribute, value)) {
      return;
    }

    if (value === undefined) {
      throw new Error(`cannot clear required attribute: ${attribute}`);
    }

    this.setAttribute(attribute, value);
  }

  public abstract toSvg(): string;

  public abstract describe(): string;

  protected setCommonAttribute(attribute: string, value: string): boolean {
    if (attribute === "fill") {
      this.fill = value;
      return true;
    }

    if (attribute === "stroke") {
      this.stroke = value;
      return true;
    }

    if (attribute === "stroke-width") {
      const width = Number(value);
      this.requirePositive(width, "stroke-width");
      this.strokeWidth = width;
      return true;
    }

    return false;
  }

  protected getCommonAttribute(attribute: string): string | undefined | null {
    if (attribute === "fill") {
      return this.fill;
    }

    if (attribute === "stroke") {
      return this.stroke;
    }

    if (attribute === "stroke-width") {
      return this.strokeWidth === undefined ? undefined : String(this.strokeWidth);
    }

    return null;
  }

  protected restoreCommonAttribute(
    attribute: string,
    value: string | undefined,
  ): boolean {
    if (attribute === "fill") {
      this.fill = value;
      return true;
    }

    if (attribute === "stroke") {
      this.stroke = value;
      return true;
    }

    if (attribute === "stroke-width") {
      if (value === undefined) {
        this.strokeWidth = undefined;
        return true;
      }

      const width = Number(value);
      this.requirePositive(width, "stroke-width");
      this.strokeWidth = width;
      return true;
    }

    return false;
  }

  protected getSvgStyleAttributes(): string {
    const attributes: string[] = [];

    if (this.fill !== undefined) {
      attributes.push(`fill="${this.escapeXml(this.fill)}"`);
    }

    if (this.stroke !== undefined) {
      attributes.push(`stroke="${this.escapeXml(this.stroke)}"`);
    }

    if (this.strokeWidth !== undefined) {
      attributes.push(`stroke-width="${this.strokeWidth}"`);
    }

    return attributes.length === 0 ? "" : ` ${attributes.join(" ")}`;
  }

  protected getStyleDescription(): string {
    const styles: string[] = [];

    if (this.fill !== undefined) {
      styles.push(`fill=${this.fill}`);
    }

    if (this.stroke !== undefined) {
      styles.push(`stroke=${this.stroke}`);
    }

    if (this.strokeWidth !== undefined) {
      styles.push(`stroke-width=${this.strokeWidth}`);
    }

    return styles.length === 0 ? "" : ` ${styles.join(" ")}`;
  }

  protected requireFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`${name} must be a finite number`);
    }
  }

  protected requirePositive(value: number, name: string): void {
    this.requireFinite(value, name);

    if (value <= 0) {
      throw new Error(`${name} must be positive`);
    }
  }

  protected escapeXml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
}