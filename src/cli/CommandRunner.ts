import { Editor } from "../app/Editor.js";

type CommandHandler = (args: string[]) => string;

export class CommandRunner {
  private readonly handlers = new Map<string, CommandHandler>();

  public constructor(private readonly editor: Editor) {
    this.handlers.set("help", () => this.help());
    this.handlers.set("init", (args) => this.handleInit(args));
    this.handlers.set("canvas", (args) => this.handleCanvas(args));
    this.handlers.set("create", (args) => this.handleCreate(args));
    this.handlers.set("delete", (args) => this.handleDelete(args));
    this.handlers.set("set", (args) => this.handleSet(args));
    this.handlers.set("move", (args) => this.handleMove(args));
    this.handlers.set("scale", (args) => this.handleScale(args));
    this.handlers.set("show", (args) => this.handleShow(args));
    this.handlers.set("undo", (args) => this.handleUndo(args));
    this.handlers.set("redo", (args) => this.handleRedo(args));
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

  private handleMove(args: string[]): string {
    const id = args[0];
    const dxText = args[1];
    const dyText = args[2];

    if (
      args.length !== 3 ||
      id === undefined ||
      dxText === undefined ||
      dyText === undefined
    ) {
      throw new Error("usage: move <id> <dx> <dy>");
    }

    return this.editor.moveShape(
      id,
      this.parseFiniteNumber(dxText, "dx"),
      this.parseFiniteNumber(dyText, "dy"),
    );
  }

  private handleScale(args: string[]): string {
    const id = args[0];
    const factorText = args[1];

    if (
      args.length !== 2 ||
      id === undefined ||
      factorText === undefined
    ) {
      throw new Error("usage: scale <id> <factor>");
    }

    return this.editor.scaleShape(
      id,
      this.parseFiniteNumber(factorText, "scale factor"),
    );
  }

    private handleDelete(args: string[]): string {
    const id = args[0];

    if (args.length !== 1 || id === undefined) {
      throw new Error("usage: delete <id>");
    }

    return this.editor.deleteShape(id);
  }

    private handleSet(args: string[]): string {
    const id = args[0];
    const attribute = args[1];
    const value = args[2];

    if (
      args.length !== 3 ||
      id === undefined ||
      attribute === undefined ||
      value === undefined
    ) {
      throw new Error("usage: set <id> <attribute> <value>");
    }

    return this.editor.setShapeAttribute(id, attribute, value);
  }

  private handleShow(args: string[]): string {
    if (args.length !== 0) {
      throw new Error("usage: show");
    }

    return this.editor.showSvg();
  }

  private handleUndo(args: string[]): string {
    if (args.length !== 0) {
      throw new Error("usage: undo");
    }

    return this.editor.undo();
  }

  private handleRedo(args: string[]): string {
    if (args.length !== 0) {
      throw new Error("usage: redo");
    }

    return this.editor.redo();
  }

  private parseDimension(value: string): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("canvas dimensions must be positive numbers");
    }

    return parsed;
  }

  private parseFiniteNumber(value: string, name: string): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      throw new Error(`${name} must be a finite number`);
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
      "  delete <id>",
      "  set <id> <attribute> <value>",
      "  move <id> <dx> <dy>",
      "  scale <id> <factor>",
      "  show",
      "  undo",
      "  redo",
      "  help",
      "  exit",
    ].join("\n");
  }
}