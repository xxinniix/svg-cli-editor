import { Editor } from "../app/Editor.js";

type CommandHandler = (args: string[]) => string;

export class CommandRunner {
  private readonly handlers = new Map<string, CommandHandler>();

  public constructor(private readonly editor: Editor) {
    this.handlers.set("help", () => this.help());
    this.handlers.set("init", (args) => this.handleInit(args));
    this.handlers.set("canvas", (args) => this.handleCanvas(args));
  }

  public execute(input: string): string {
    const args = input.trim().split(/\s+/);
    const commandName = args.shift();

    if (commandName === undefined || commandName === "") {
      return "";
    }

    const handler = this.handlers.get(commandName);

    if (handler === undefined) {
      return `error: unknown command: ${commandName}`;
    }

    try {
      return handler(args);
    } catch (error) {
      return `error: ${this.getErrorMessage(error)}`;
    }
  }

  private handleInit(args: string[]): string {
    if (args.length === 0) {
      return this.editor.initialize();
    }

    const widthText = args[0];
    const heightText = args[1];

    if (
      args.length !== 2 ||
      widthText === undefined ||
      heightText === undefined
    ) {
      throw new Error("usage: init [width] [height]");
    }

    return this.editor.initialize(
      this.parseDimension(widthText),
      this.parseDimension(heightText),
    );
  }

  private handleCanvas(args: string[]): string {
    if (args.length === 0) {
      return this.editor.showCanvas();
    }

    const widthText = args[0];
    const heightText = args[1];

    if (
      args.length !== 2 ||
      widthText === undefined ||
      heightText === undefined
    ) {
      throw new Error("usage: canvas [width] [height]");
    }

    return this.editor.resizeCanvas(
      this.parseDimension(widthText),
      this.parseDimension(heightText),
    );
  }

  private parseDimension(value: string): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("canvas dimensions must be positive numbers");
    }

    return parsed;
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "unexpected error";
  }

  private help(): string {
    return [
      "Available commands:",
      "  init [width] [height]",
      "  canvas [width] [height]",
      "  help",
      "  exit",
    ].join("\n");
  }
}