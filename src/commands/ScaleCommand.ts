import { Shape } from "../model/shapes/Shape.js";
import type { EditorCommand } from "./EditorCommand.js";

export class ScaleCommand implements EditorCommand {
  public constructor(
    private readonly shape: Shape,
    private readonly factor: number,
  ) {}

  public execute(): void {
    this.shape.scale(this.factor);
  }

  public undo(): void {
    this.shape.scale(1 / this.factor);
  }
}