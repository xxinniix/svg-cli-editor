import { Editor } from "../app/Editor.js";

type CommandHandler = (args: string[]) => string;

export class CommandRunner {
  private readonly handlers = new Map<string, CommandHandler>();

  public constructor(private readonly editor: Editor) {
    this.handlers.set("help", () => this.help());
    this.handlers.set("init", (args) => this.handleInit(args));
    this.handlers.set("canvas", (args) => this.handleCanvas(args));
    this.handlers.set("create", (args) => this.handleCreate(args));
    this.handlers.set("show", (args) => this.handleShow(args));
  }

  public execute(input: string): string {
    try {
      const args = this.tokenize(input);
      const commandName = args.shift();

      if (commandName === undefined || commandName === "") {
        return "";
      }

      const handler = this.handlers.get(commandName);

      if (handler === undefined) {
        return `error: unknown command: ${commandName}`;
      }

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

  private handleCreate(args: string[]): string {
    const type = args[0];
    const id = args[1];

    if (type === undefined || id === undefined) {
      throw new Error(
        "usage: create <type> <id> <parameters...> [attribute=value ...]",
      );
    }

    return this.editor.createShape(type, id, args.slice(2));
  }

  private handleShow(args: string[]): string {
    if (args.length !== 0) {
      throw new Error("usage: show");
    }

    return this.editor.showSvg();
  }

  private parseDimension(value: string): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("canvas dimensions must be positive numbers");
    }

    return parsed;
  }

  private tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let quote: string | null = null;
    let hasToken = false;

    for (const character of input.trim()) {
      if (quote !== null) {
        if (character === quote) {
          quote = null;
        } else {
          current += character;
        }

        hasToken = true;
        continue;
      }

      if (character === '"' || character === "'") {
        quote = character;
        hasToken = true;
        continue;
      }

      if (/\s/.test(character)) {
        if (hasToken) {
          tokens.push(current);
          current = "";
          hasToken = false;
        }

        continue;
      }

      current += character;
      hasToken = true;
    }

    if (quote !== null) {
      throw new Error("unterminated quoted string");
    }

    if (hasToken) {
      tokens.push(current);
    }

    return tokens;
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "unexpected error";
  }

  private help(): string {
    return [
      "Available commands:",
      "  init [width] [height]",
      "  canvas [width] [height]",
      "  create <type> <id> <parameters...> [attribute=value ...]",
      "  show",
      "  help",
      "  exit",
    ].join("\n");
  }
}