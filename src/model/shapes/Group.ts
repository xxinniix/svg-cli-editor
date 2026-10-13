import { Shape } from "./Shape.js";

export class Group extends Shape {
      public constructor(id: string, fill?: string) {
    super(id, fill);
  }
  private readonly children: Shape[] = [];

  public getType(): string {
    return "g";
  }

  public getChildren(): readonly Shape[] {
    return [...this.children];
  }

  public addChild(child: Shape): void {
    if (child === this) {
      throw new Error("a group cannot contain itself");
    }

    if (child instanceof Group && child.contains(this)) {
      throw new Error("cannot add a group to its own descendant");
    }

    const previousParent = child.getParent();

    if (previousParent !== null) {
      previousParent.removeChild(child);
    }

    this.children.push(child);
    child.setParent(this);
  }

  public removeChild(child: Shape): void {
    const index = this.children.indexOf(child);

    if (index === -1) {
      throw new Error(`shape is not a child of g#${this.getId()}`);
    }

    this.children.splice(index, 1);
    child.setParent(null);
  }

  public contains(shape: Shape): boolean {
    return this.children.some((child) => {
      return child === shape || (
        child instanceof Group && child.contains(shape)
      );
    });
  }

  public move(dx: number, dy: number): void {
    this.requireFinite(dx, "dx");
    this.requireFinite(dy, "dy");

    for (const child of this.children) {
      child.move(dx, dy);
    }
  }

  public scale(factor: number): void {
    this.requirePositive(factor, "scale factor");

    for (const child of this.children) {
      child.scale(factor);
    }
  }

  public setAttribute(attribute: string, value: string): void {
    if (this.setCommonAttribute(attribute, value)) {
      return;
    }

    throw new Error(`unknown attribute: ${attribute}`);
  }

  public toSvg(): string {
    const childSvg = this.children
      .map((child) => child.toSvg())
      .join("");

    return `<g id="${this.escapeXml(this.getId())}"${this.getSvgStyleAttributes()}>${childSvg}</g>`;
  }

  public describe(): string {
    return `g#${this.getId()}${this.getStyleDescription()}`;
  }
}