import { SvgDocument } from "../model/SvgDocument.js";
import { Group } from "../model/shapes/Group.js";
import { Shape } from "../model/shapes/Shape.js";
import type { EditorCommand } from "./EditorCommand.js";

export class UngroupCommand implements EditorCommand {
  private group: Group | null = null;
  private parent: Group | null = null;
  private insertionIndex: number | null = null;
  private children: Shape[] = [];

  public constructor(
    private readonly document: SvgDocument,
    private readonly groupId: string,
  ) {}

  public execute(): void {
    if (this.group === null) {
      this.captureGroup();
    }

    if (this.group === null || this.insertionIndex === null) {
      throw new Error("ungroup command could not be initialized");
    }

    for (const child of this.children) {
      this.group.removeChild(child);
    }

    this.document.removeShape(this.groupId);

    let index = this.insertionIndex;

    for (const child of this.children) {
      this.document.restoreShape(child, this.parent, index);
      index += 1;
    }
  }

  public undo(): void {
    if (this.group === null || this.insertionIndex === null) {
      throw new Error("ungroup command has not been executed");
    }

    for (const child of this.children) {
      this.document.removeShape(child.getId());
    }

    this.document.restoreShape(
      this.group,
      this.parent,
      this.insertionIndex,
    );

    for (const child of this.children) {
      this.document.restoreShape(
        child,
        this.group,
        this.group.getChildren().length,
      );
    }
  }

  private captureGroup(): void {
    const shape = this.document.findShape(this.groupId);

    if (shape === undefined) {
      throw new Error(`no such shape: ${this.groupId}`);
    }

    if (!(shape instanceof Group)) {
      throw new Error(`cannot ungroup composite shape: ${this.groupId}`);
    }

    this.group = shape;
    this.parent = shape.getParent();

    if (this.parent === null) {
      throw new Error(`cannot ungroup top-level container: ${this.groupId}`);
    }

    this.insertionIndex = this.parent === null
      ? this.document.getRootShapeIndex(shape)
      : this.parent.getChildren().indexOf(shape);
    this.children = [...shape.getChildren()];
  }
}
