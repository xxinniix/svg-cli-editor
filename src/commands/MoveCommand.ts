import { Shape } from "../model/shapes/Shape.js";
import type { EditorCommand } from "./EditorCommand.js";

export class MoveCommand implements EditorCommand {
  public constructor(
    private readonly shape: Shape,
    private readonly dx: number,
    private readonly dy: number,
  ) {}

  public execute(): void {
    this.shape.move(this.dx, this.dy);
  }

  public undo(): void {
    this.shape.move(-this.dx, -this.dy);
  }
}