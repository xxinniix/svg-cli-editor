import { SvgDocument } from "../model/SvgDocument.js";
import { Group } from "../model/shapes/Group.js";
import { Shape } from "../model/shapes/Shape.js";
import type { EditorCommand } from "./EditorCommand.js";

export class MoveToGroupCommand implements EditorCommand {
  private shape: Shape | null = null;
  private originalParent: Group | null = null;
  private originalIndex: number | null = null;

  public constructor(
    private readonly document: SvgDocument,
    private readonly shapeId: string,
    private readonly groupId: string,
  ) {}

  public execute(): void {
    const shape = this.document.findShape(this.shapeId);

    if (shape === undefined) {
      throw new Error(`no such shape: ${this.shapeId}`);
    }

    const target = this.document.findShape(this.groupId);

    if (target === undefined) {
      throw new Error(`no such container: ${this.groupId}`);
    }

    if (!(target instanceof Group)) {
      throw new Error(`not a container: ${this.groupId}`);
    }

    if (shape === target) {
      throw new Error("a group cannot contain itself");
    }

    if (shape instanceof Group && shape.contains(target)) {
      throw new Error("cannot move a group into its own descendant");
    }

    if (this.shape === null) {
      this.shape = shape;
      this.originalParent = shape.getParent();
      this.originalIndex = this.originalParent === null
        ? this.document.getRootShapeIndex(shape)
        : this.originalParent.getChildren().indexOf(shape);
    }

    this.document.removeShape(this.shapeId);
    this.document.restoreShape(
      shape,
      target,
      target.getChildren().length,
    );
  }

  public undo(): void {
    if (
      this.shape === null ||
      this.originalIndex === null
    ) {
      throw new Error("move-to-group command has not been executed");
    }

    this.document.removeShape(this.shape.getId());
    this.document.restoreShape(
      this.shape,
      this.originalParent,
      this.originalIndex,
    );
  }
}
