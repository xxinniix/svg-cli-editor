import { SvgDocument } from "../model/SvgDocument.js";
import { Group } from "../model/shapes/Group.js";
import { Shape } from "../model/shapes/Shape.js";
import type { EditorCommand } from "./EditorCommand.js";

type ShapePosition = {
  readonly shape: Shape;
  readonly parent: Group | null;
  readonly index: number;
};

/** Groups existing shapes, even when they currently belong to different groups. */
export class GroupShapesCommand implements EditorCommand {
  private group: Group | null = null;
  private groupParent: Group | null = null;
  private insertionIndex: number | null = null;
  private positions: ShapePosition[] = [];

  public constructor(
    private readonly document: SvgDocument,
    private readonly groupId: string,
    private readonly shapeIds: readonly string[],
  ) {}

  public execute(): void {
    if (this.group === null) {
      this.captureOriginalPositions();
    }

    if (this.group === null || this.insertionIndex === null) {
      throw new Error("group command could not be initialized");
    }

    for (const position of this.positions) {
      this.document.removeShape(position.shape.getId());
    }

    this.document.restoreShape(
      this.group,
      this.groupParent,
      this.insertionIndex,
    );

    for (const position of this.positions) {
      this.document.restoreShape(
        position.shape,
        this.group,
        this.group.getChildren().length,
      );
    }
  }

  public undo(): void {
    if (this.group === null || this.insertionIndex === null) {
      throw new Error("group command has not been executed");
    }

    for (const position of this.positions) {
      this.group.removeChild(position.shape);
    }

    this.document.removeShape(this.group.getId());

    for (const position of this.restoreOrder()) {
      this.document.restoreShape(
        position.shape,
        position.parent,
        position.index,
      );
    }
  }

  private captureOriginalPositions(): void {
    if (this.shapeIds.length === 0) {
      throw new Error("group requires at least one shape id");
    }

    if (new Set(this.shapeIds).size !== this.shapeIds.length) {
      throw new Error("group shape ids must be unique");
    }

    if (this.document.findShape(this.groupId) !== undefined) {
      throw new Error(`id already exists: ${this.groupId}`);
    }

    const shapes = this.shapeIds.map((id) => {
      const shape = this.document.findShape(id);

      if (shape === undefined) {
        throw new Error(`no such shape: ${id}`);
      }

      return shape;
    });

    this.rejectAncestorAndDescendantPair(shapes);

    const firstShape = shapes[0];

    if (firstShape === undefined) {
      throw new Error("group requires at least one shape id");
    }

    this.positions = shapes.map((shape) => {
      const parent = shape.getParent();

      return {
        shape,
        parent,
        index: parent === null
          ? this.document.getRootShapeIndex(shape)
          : parent.getChildren().indexOf(shape),
      };
    });

    const firstPosition = this.positions[0];

    if (firstPosition === undefined) {
      throw new Error("group requires at least one shape id");
    }

    this.group = new Group(this.groupId);
    this.groupParent = firstPosition.parent;
    this.insertionIndex = firstPosition.index;
  }

  private rejectAncestorAndDescendantPair(shapes: readonly Shape[]): void {
    for (const possibleContainer of shapes) {
      if (!(possibleContainer instanceof Group)) {
        continue;
      }

      for (const possibleDescendant of shapes) {
        if (possibleContainer.contains(possibleDescendant)) {
          throw new Error(
            `cannot group a container into its own descendant: ${possibleContainer.getId()}`,
          );
        }
      }
    }
  }

  /** Restore earlier sibling indices first for each original parent. */
  private restoreOrder(): readonly ShapePosition[] {
    return [...this.positions].sort((left, right) => {
      if (left.parent !== right.parent) {
        return 0;
      }

      return left.index - right.index;
    });
  }
}
