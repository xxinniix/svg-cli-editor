import { SvgDocument } from "../model/SvgDocument.js";
import { Shape } from "../model/shapes/Shape.js";
import type { EditorCommand } from "./EditorCommand.js";

export class CreateShapeCommand implements EditorCommand {
  public constructor(
    private readonly document: SvgDocument,
    private readonly shape: Shape,
  ) {}

  public execute(): void {
    this.document.addShape(this.shape);
  }

  public undo(): void {
    this.document.removeShape(this.shape.getId());
  }
}