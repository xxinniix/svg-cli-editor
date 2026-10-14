import { Shape } from "../model/shapes/Shape.js";
import type { EditorCommand } from "./EditorCommand.js";

export class SetAttributeCommand implements EditorCommand {
  private previousValue: string | undefined;
  private hasExecuted = false;

  public constructor(
    private readonly shape: Shape,
    private readonly attribute: string,
    private readonly value: string,
  ) {}

  public execute(): void {
    if (!this.hasExecuted) {
      this.previousValue = this.shape.getAttribute(this.attribute);
      this.hasExecuted = true;
    }

    this.shape.setAttribute(this.attribute, this.value);
  }

  public undo(): void {
    if (!this.hasExecuted) {
      throw new Error("set command has not been executed");
    }

    this.shape.restoreAttribute(this.attribute, this.previousValue);
  }
}