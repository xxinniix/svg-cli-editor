import { SvgDocument } from "../model/SvgDocument.js";
import { Group } from "../model/shapes/Group.js";
import { Shape } from "../model/shapes/Shape.js";
import type { EditorCommand } from "./EditorCommand.js";

export class DeleteShapeCommand implements EditorCommand {
  private shape: Shape | null = null;
  private parent: Group | null = null;
  private index: number | null = null;

  public constructor(
    private readonly document: SvgDocument,
    private readonly id: string,
  ) {}

  public execute(): void {
    const shape = this.document.findShape(this.id);

    if (shape === undefined) {
      throw new Error(`no such shape: ${this.id}`);
    }

    if (this.shape === null) {
      this.shape = shape;
      this.parent = shape.getParent();
      this.index = this.parent === null
        ? this.document.getRootShapeIndex(shape)
        : this.parent.getChildren().indexOf(shape);
    }

    this.document.removeShape(this.id);
  }

  public undo(): void {
    if (this.shape === null || this.index === null) {
      throw new Error("delete command has not been executed");
    }

    this.document.restoreShape(this.shape, this.parent, this.index);
  }
}