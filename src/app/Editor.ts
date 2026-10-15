import { CommandHistory } from "../commands/CommandHistory.js";
import { CreateShapeCommand } from "../commands/CreateShapeCommand.js";
import { DeleteShapeCommand } from "../commands/DeleteShapeCommand.js";
import type { EditorCommand } from "../commands/EditorCommand.js";
import { GroupShapesCommand } from "../commands/GroupShapesCommand.js";
import { MoveCommand } from "../commands/MoveCommand.js";
import { MoveToGroupCommand } from "../commands/MoveToGroupCommand.js";
import { ReorderShapeCommand } from "../commands/ReorderShapeCommand.js";
import type { ReorderPlacement } from "../commands/ReorderShapeCommand.js";
import { ScaleCommand } from "../commands/ScaleCommand.js";
import { SetAttributeCommand } from "../commands/SetAttributeCommand.js";
import { UngroupCommand } from "../commands/UngroupCommand.js";
import { SvgFileStore } from "../io/SvgFileStore.js";
import { ShapeFactory } from "../model/ShapeFactory.js";
import { SvgDocument } from "../model/SvgDocument.js";
import { Group } from "../model/shapes/Group.js";
import type { Shape } from "../model/shapes/Shape.js";

/** Application service used by the CLI. It owns document-session state. */
export class Editor {
  private document: SvgDocument | null = null;
  private history = new CommandHistory();
  private readonly shapeFactory = new ShapeFactory();
  private readonly fileStore = new SvgFileStore();
  private currentFilePath: string | null = null;
  private undoRedoLocked = true;

  public initialize(width = 800, height = 600): string {
    this.document = new SvgDocument(width, height);
    this.resetAfterDocumentOperation(null);
    return `canvas ${width}x${height} created`;
  }

  public read(filePath: string): string {
    const result = this.fileStore.load(filePath);

    this.document = result.document;
    this.resetAfterDocumentOperation(filePath);

    return [
      `loaded ${filePath}`,
      ...result.warnings.map((warning) => `warning: ${warning}`),
    ].join("\n");
  }

  public showCanvas(): string {
    const document = this.getDocument();
    return `canvas ${document.getWidth()}x${document.getHeight()}`;
  }

  public resizeCanvas(width: number, height: number): string {
    const document = this.getDocument();
    document.resize(width, height);
    this.resetAfterDocumentOperation(this.currentFilePath);
    return `canvas resized to ${width}x${height}`;
  }

  public createShape(
    type: string,
    id: string,
    argumentsAfterId: readonly string[],
    parentId?: string,
  ): string {
    const document = this.getDocument();
    const parameterCount = this.shapeFactory.getParameterCount(type);
    const parameters = argumentsAfterId.slice(0, parameterCount);
    const styleTokens = argumentsAfterId.slice(parameterCount);
    const shape = this.shapeFactory.create(type, id, parameters);

    this.applyCreationStyles(shape, styleTokens);
    const parent = parentId === undefined
      ? undefined
      : this.getContainer(parentId);
    this.executeEdit(new CreateShapeCommand(document, shape, parent));

    return parent === undefined
      ? `created ${shape.getType()}#${shape.getId()}`
      : `created ${shape.getType()}#${shape.getId()} in g#${parent.getId()}`;
  }

  public moveShape(id: string, dx: number, dy: number): string {
    const shape = this.getShape(id);
    this.executeEdit(new MoveCommand(shape, dx, dy));
    return `moved ${id} by (${dx}, ${dy})`;
  }

  public scaleShape(id: string, factor: number): string {
    const shape = this.getShape(id);
    this.executeEdit(new ScaleCommand(shape, factor));
    return `scaled ${id} by ${factor}`;
  }

  public deleteShape(id: string): string {
    this.executeEdit(new DeleteShapeCommand(this.getDocument(), id));
    return `deleted ${id}`;
  }

  public setShapeAttribute(
    id: string,
    attribute: string,
    value: string,
  ): string {
    const shape = this.getShape(id);
    this.executeEdit(new SetAttributeCommand(shape, attribute, value));
    return `set ${id} ${attribute}=${value}`;
  }

  public addShapeToGroup(groupId: string, id: string): string {
    this.executeEdit(new MoveToGroupCommand(this.getDocument(), id, groupId));
    return `added ${id} to ${groupId}`;
  }

  public groupShapes(groupId: string, shapeIds: readonly string[]): string {
    this.executeEdit(
      new GroupShapesCommand(this.getDocument(), groupId, shapeIds),
    );
    return `grouped ${shapeIds.length} shape(s) as ${groupId}`;
  }

  public ungroupShape(groupId: string): string {
    this.executeEdit(new UngroupCommand(this.getDocument(), groupId));
    return `ungrouped ${groupId}`;
  }

  public reorderShape(id: string, placement: ReorderPlacement): string {
    this.executeEdit(
      new ReorderShapeCommand(this.getDocument(), id, placement),
    );

    return placement === "front"
      ? `brought ${id} to front`
      : `sent ${id} to back`;
  }

  public undo(): string {
    this.ensureUndoRedoAllowed("undo");

    if (!this.history.undo()) {
      throw new Error("nothing to undo");
    }

    return "undid last command";
  }

  public redo(): string {
    this.ensureUndoRedoAllowed("redo");

    if (!this.history.redo()) {
      throw new Error("nothing to redo");
    }

    return "redid last command";
  }

  /** Kept as a convenience for displaying the complete serialized SVG. */
  public showSvg(): string {
    return this.getDocument().toSvg();
  }

  public showShape(id: string): string {
    return this.getDocument().describeShape(id);
  }

  public showTree(id?: string): string {
    return this.getDocument().describeTree(id);
  }

  public save(filePath?: string): string {
    const document = this.getDocument();
    const targetPath = filePath ?? this.currentFilePath;

    if (targetPath === null) {
      throw new Error("no save path. use 'save <file>' first");
    }

    this.fileStore.save(document, targetPath);
    this.resetAfterDocumentOperation(targetPath);
    return `saved ${targetPath}`;
  }

  private executeEdit(command: EditorCommand): void {
    this.history.execute(command);
    this.undoRedoLocked = false;
  }

  private resetAfterDocumentOperation(filePath: string | null): void {
    this.history = new CommandHistory();
    this.currentFilePath = filePath;
    this.undoRedoLocked = true;
  }

  private ensureUndoRedoAllowed(operation: "undo" | "redo"): void {
    this.getDocument();

    if (this.undoRedoLocked) {
      throw new Error(`${operation} not allowed after io command`);
    }
  }

  private applyCreationStyles(shape: Shape, tokens: readonly string[]): void {
    if (tokens.length === 0) {
      return;
    }

    if (tokens.length === 1 && !tokens[0]?.includes("=")) {
      const token = tokens[0];

      if (token === undefined) {
        throw new Error("missing style value");
      }

      shape.setAttribute(shape.getType() === "line" ? "stroke" : "fill", token);
      return;
    }

    for (const token of tokens) {
      this.applyAttribute(shape, token);
    }
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

  private getContainer(id: string): Group {
    const candidate = this.getDocument().findShape(id);

    if (candidate === undefined) {
      throw new Error(`no such container: ${id}`);
    }

    if (!(candidate instanceof Group)) {
      throw new Error(`not a container: ${id}`);
    }

    return candidate;
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
