import { Group } from "./shapes/Group.js";
import { Shape } from "./shapes/Shape.js";

export class SvgDocument {
  private readonly rootShapes: Shape[] = [];

  public constructor(
    private width: number,
    private height: number,
  ) {
    this.assertValidDimension(width);
    this.assertValidDimension(height);
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public resize(width: number, height: number): void {
    this.assertValidDimension(width);
    this.assertValidDimension(height);

    this.width = width;
    this.height = height;
  }

  public getRootShapes(): readonly Shape[] {
    return [...this.rootShapes];
  }

  public getRootShapeIndex(shape: Shape): number {
    return this.rootShapes.indexOf(shape);
  }

  public restoreShape(
    shape: Shape,
    parent: Group | null,
    index: number,
  ): void {
    if (this.findShape(shape.getId()) !== undefined) {
      throw new Error(`id already exists: ${shape.getId()}`);
    }

    if (parent !== null) {
      if (!this.isManagedShape(parent)) {
        throw new Error(`no such container: ${parent.getId()}`);
      }

      parent.insertChild(shape, index);
      return;
    }

    if (!Number.isInteger(index) || index < 0 || index > this.rootShapes.length) {
      throw new Error("root insertion index is out of range");
    }

    this.rootShapes.splice(index, 0, shape);
    shape.setParent(null);
  }

  public getShapeCount(): number {
    return this.rootShapes.reduce((count, shape) => {
      return count + this.countShapeTree(shape);
    }, 0);
  }

  public addShape(shape: Shape, parent?: Group): void {
    if (this.findShape(shape.getId()) !== undefined) {
      throw new Error(`id already exists: ${shape.getId()}`);
    }

    if (parent !== undefined) {
      if (!this.isManagedShape(parent)) {
        throw new Error(`no such container: ${parent.getId()}`);
      }

      parent.addChild(shape);
      return;
    }

    this.rootShapes.push(shape);
    shape.setParent(null);
  }

  public removeShape(id: string): Shape {
    const shape = this.findShape(id);

    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }

    const parent = shape.getParent();

    if (parent !== null) {
      parent.removeChild(shape);
      return shape;
    }

    const index = this.rootShapes.indexOf(shape);
    this.rootShapes.splice(index, 1);
    return shape;
  }

  public findShape(id: string): Shape | undefined {
    for (const shape of this.rootShapes) {
      const found = this.findInTree(shape, id);

      if (found !== undefined) {
        return found;
      }
    }

    return undefined;
  }

  public toSvg(): string {
    const content = this.rootShapes
      .map((shape) => `  ${shape.toSvg()}`)
      .join("\n");

    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
           `<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">`,
    ];

    if (content !== "") {
      lines.push(content);
    }

    lines.push("</svg>");
    return lines.join("\n");
  }
  public describeTree(rootId?: string): string {
    if (rootId !== undefined) {
      const root = this.findShape(rootId);

      if (root === undefined) {
        throw new Error(`no such shape: ${rootId}`);
      }

      const lines: string[] = [];
      this.appendTree(lines, root, 0);
      return lines.join("\n");
    }

    const lines = [`svg ${this.width}x${this.height}`];

    for (const shape of this.rootShapes) {
      this.appendTree(lines, shape, 1);
    }

    return lines.join("\n");
  }

  public describeShape(id: string): string {
    const shape = this.findShape(id);

    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }

    const parent = shape.getParent();
    const parentDescription = parent === null
      ? "svg"
      : `g#${parent.getId()}`;
    const prefix = `${shape.getType()}#${shape.getId()}`;
    const details = shape.describe().slice(prefix.length).trim();

    return details === ""
      ? `${prefix}  parent=${parentDescription}`
      : `${prefix}  parent=${parentDescription}\n  ${details}`;
  }

  private appendTree(lines: string[], shape: Shape, depth: number): void {
    lines.push(`${"  ".repeat(depth)}${shape.describe()}`);

    if (shape instanceof Group) {
      for (const child of shape.getChildren()) {
        this.appendTree(lines, child, depth + 1);
      }
    }
  }
  private findInTree(shape: Shape, id: string): Shape | undefined {
    if (shape.getId() === id) {
      return shape;
    }

    if (shape instanceof Group) {
      for (const child of shape.getChildren()) {
        const found = this.findInTree(child, id);

        if (found !== undefined) {
          return found;
        }
      }
    }

    return undefined;
  }

  private isManagedShape(shape: Shape): boolean {
    return this.findShape(shape.getId()) === shape;
  }

  private countShapeTree(shape: Shape): number {
    if (!(shape instanceof Group)) {
      return 1;
    }

    return 1 + shape.getChildren().reduce((count, child) => {
      return count + this.countShapeTree(child);
    }, 0);
  }

  private assertValidDimension(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("canvas dimensions must be positive numbers");
    }
  }
}
