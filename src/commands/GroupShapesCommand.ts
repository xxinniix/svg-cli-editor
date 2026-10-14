import { SvgDocument } from "../model/SvgDocument.js";
import { Group } from "../model/shapes/Group.js";
import { Shape } from "../model/shapes/Shape.js";
import type { EditorCommand } from "./EditorCommand.js";

type ShapePosition = {
  shape: Shape;
  parent: Group | null;
  index: number;
};

export class GroupShapesCommand implements EditorCommand {
  private group: Group | null = null;
  private parent: Group | null = null;
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
      this.parent,
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
    if (
      this.group === null ||
      this.insertionIndex === null
    ) {
      throw new Error("group command has not been executed");
    }

    for (const position of this.positions) {
      this.group.removeChild(position.shape);
    }

    this.document.removeShape(this.group.getId());

    for (const position of this.positions) {
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

    const firstShape = shapes[0];

    if (firstShape === undefined) {
      throw new Error("group requires at least one shape id");
    }

    const parent = firstShape.getParent();

    for (const shape of shapes) {
      if (shape.getParent() !== parent) {
        throw new Error("shapes must share the same parent");
      }
    }

    this.positions = shapes
      .map((shape) => ({
        shape,
        parent,
        index: parent === null
          ? this.document.getRootShapeIndex(shape)
          : parent.getChildren().indexOf(shape),
      }))
      .sort((left, right) => left.index - right.index);

    const firstPosition = this.positions[0];

    if (firstPosition === undefined) {
      throw new Error("group requires at least one shape id");
    }

    this.group = new Group(this.groupId);
    this.parent = parent;
    this.insertionIndex = firstPosition.index;
  }
}