import type { EditorCommand } from "./EditorCommand.js";

export class CommandHistory {
  private readonly undoStack: EditorCommand[] = [];
  private readonly redoStack: EditorCommand[] = [];

  public execute(command: EditorCommand): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack.length = 0;
  }

  public undo(): boolean {
    const command = this.undoStack.pop();

    if (command === undefined) {
      return false;
    }

    command.undo();
    this.redoStack.push(command);
    return true;
  }

  public redo(): boolean {
    const command = this.redoStack.pop();

    if (command === undefined) {
      return false;
    }

    command.execute();
    this.undoStack.push(command);
    return true;
  }
}