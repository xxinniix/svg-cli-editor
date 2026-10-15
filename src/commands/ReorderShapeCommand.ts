import { SvgDocument } from "../model/SvgDocument.js";
import { Group } from "../model/shapes/Group.js";
import { Shape } from "../model/shapes/Shape.js";
import type { EditorCommand } from "./EditorCommand.js";

export type ReorderPlacement = "front" | "back";

export class ReorderShapeCommand implements EditorCommand {
  private shape: Shape | null = null;
  private parent: Group | null = null;
  private originalIndex: number | null = null;

  public constructor(
    private readonly document: SvgDocument,
    private readonly id: string,
    private readonly placement: ReorderPlacement,
  ) {}

  public execute(): void {
    const shape = this.document.findShape(this.id);

    if (shape === undefined) {
      throw new Error(`no such shape: ${this.id}`);
    }

    if (this.shape === null) {
      this.shape = shape;
      this.parent = shape.getParent();
      this.originalIndex = this.parent === null
        ? this.document.getRootShapeIndex(shape)
        : this.parent.getChildren().indexOf(shape);
    }

    this.document.removeShape(this.id);

    const targetIndex = this.placement === "front"
      ? this.parent === null
        ? this.document.getRootShapes().length
        : this.parent.getChildren().length
      : 0;

    this.document.restoreShape(shape, this.parent, targetIndex);
  }

  public undo(): void {
    if (this.shape === null || this.originalIndex === null) {
      throw new Error("reorder command has not been executed");
    }

    this.document.removeShape(this.shape.getId());
    this.document.restoreShape(
      this.shape,
      this.parent,
      this.originalIndex,
    );
  }
}