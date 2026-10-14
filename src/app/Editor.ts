import { CommandHistory } from "../commands/CommandHistory.js";
import { CreateShapeCommand } from "../commands/CreateShapeCommand.js";
import { MoveCommand } from "../commands/MoveCommand.js";
import { ScaleCommand } from "../commands/ScaleCommand.js";
import { ShapeFactory } from "../model/ShapeFactory.js";
import { SvgDocument } from "../model/SvgDocument.js";
import type { Shape } from "../model/shapes/Shape.js";
import { DeleteShapeCommand } from "../commands/DeleteShapeCommand.js";
import { SetAttributeCommand } from "../commands/SetAttributeCommand.js";
import { MoveToGroupCommand } from "../commands/MoveToGroupCommand.js";

export class Editor {
  private document: SvgDocument | null = null;
  private history = new CommandHistory();
  private readonly shapeFactory = new ShapeFactory();

  public initialize(width = 800, height = 600): string {
    this.document = new SvgDocument(width, height);
    this.history = new CommandHistory();
    return `canvas ${width}x${height} created`;
  }

  public showCanvas(): string {
    const document = this.getDocument();
    return `canvas ${document.getWidth()}x${document.getHeight()}`;
  }

  public resizeCanvas(width: number, height: number): string {
    const document = this.getDocument();
    document.resize(width, height);
    return `canvas resized to ${width}x${height}`;
  }

  public createShape(
    type: string,
    id: string,
    argumentsAfterId: readonly string[],
  ): string {
    const document = this.getDocument();
    const parameterCount = this.shapeFactory.getParameterCount(type);
    const parameters = argumentsAfterId.slice(0, parameterCount);
    const attributeTokens = argumentsAfterId.slice(parameterCount);
    const shape = this.shapeFactory.create(type, id, parameters);

    for (const token of attributeTokens) {
      this.applyAttribute(shape, token);
    }

    this.history.execute(new CreateShapeCommand(document, shape));
    return `created ${shape.getType()}#${shape.getId()}`;
  }

  public moveShape(id: string, dx: number, dy: number): string {
    const shape = this.getShape(id);
    this.history.execute(new MoveCommand(shape, dx, dy));
    return `moved ${id} by (${dx}, ${dy})`;
  }

  public scaleShape(id: string, factor: number): string {
    const shape = this.getShape(id);
    this.history.execute(new ScaleCommand(shape, factor));
    return `scaled ${id} by ${factor}`;
  }

    public deleteShape(id: string): string {
    const document = this.getDocument();
    this.history.execute(new DeleteShapeCommand(document, id));
    return `deleted ${id}`;
  }

    public setShapeAttribute(
    id: string,
    attribute: string,
    value: string,
  ): string {
    const shape = this.getShape(id);
    this.history.execute(new SetAttributeCommand(shape, attribute, value));
    return `set ${id} ${attribute}=${value}`;
  }
    public addShapeToGroup(id: string, groupId: string): string {
    const document = this.getDocument();
    this.history.execute(new MoveToGroupCommand(document, id, groupId));
    return `added ${id} to ${groupId}`;
  }

  public undo(): string {
    if (!this.history.undo()) {
      throw new Error("nothing to undo");
    }

    return "undid last command";
  }

  public redo(): string {
    if (!this.history.redo()) {
      throw new Error("nothing to redo");
    }

    return "redid last command";
  }

  public showSvg(): string {
    return this.getDocument().toSvg();
  }

  private applyAttribute(shape: Shape, token: string): void {
    const equalsIndex = token.indexOf("=");

    if (equalsIndex <= 0 || equalsIndex === token.length - 1) {
      throw new Error("attributes must use name=value");
    }

    shape.setAttribute(
      token.slice(0, equalsIndex),
      token.slice(equalsIndex + 1),
    );
  }

  private getShape(id: string): Shape {
    const shape = this.getDocument().findShape(id);

    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }

    return shape;
  }

  private getDocument(): SvgDocument {
    if (this.document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    return this.document;
  }
}