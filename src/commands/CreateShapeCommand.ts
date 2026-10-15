import { SvgDocument } from "../model/SvgDocument.js";
import type { Group } from "../model/shapes/Group.js";
import { Shape } from "../model/shapes/Shape.js";
import type { EditorCommand } from "./EditorCommand.js";

export class CreateShapeCommand implements EditorCommand {
  public constructor(
    private readonly document: SvgDocument,
    private readonly shape: Shape,
    private readonly parent: Group | undefined,
  ) {}

  public execute(): void {
    this.document.addShape(this.shape, this.parent);
  }

  public undo(): void {
    this.document.removeShape(this.shape.getId());
  }
}
