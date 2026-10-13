import { Circle } from "./shapes/Circle.js";
import { Ellipse } from "./shapes/Ellipse.js";
import { Group } from "./shapes/Group.js";
import { Line } from "./shapes/Line.js";
import { Rect } from "./shapes/Rect.js";
import { Shape } from "./shapes/Shape.js";
import { Text } from "./shapes/Text.js";

export class ShapeFactory {
  public create(type: string, id: string, parameters: readonly string[]): Shape {
    switch (type) {
      case "rect":
        this.requireArity(type, parameters, 4);
        return new Rect(
          id,
          this.numberAt(parameters, 0, "x"),
          this.numberAt(parameters, 1, "y"),
          this.numberAt(parameters, 2, "width"),
          this.numberAt(parameters, 3, "height"),
        );

      case "circle":
        this.requireArity(type, parameters, 3);
        return new Circle(
          id,
          this.numberAt(parameters, 0, "cx"),
          this.numberAt(parameters, 1, "cy"),
          this.numberAt(parameters, 2, "r"),
        );

      case "ellipse":
        this.requireArity(type, parameters, 4);
        return new Ellipse(
          id,
          this.numberAt(parameters, 0, "cx"),
          this.numberAt(parameters, 1, "cy"),
          this.numberAt(parameters, 2, "rx"),
          this.numberAt(parameters, 3, "ry"),
        );

      case "line":
        this.requireArity(type, parameters, 4);
        return new Line(
          id,
          this.numberAt(parameters, 0, "x1"),
          this.numberAt(parameters, 1, "y1"),
          this.numberAt(parameters, 2, "x2"),
          this.numberAt(parameters, 3, "y2"),
        );

      case "text":
        this.requireArity(type, parameters, 3);
        return new Text(
          id,
          this.numberAt(parameters, 0, "x"),
          this.numberAt(parameters, 1, "y"),
          this.valueAt(parameters, 2),
        );

      case "g":
        this.requireArity(type, parameters, 0);
        return new Group(id);

      default:
        throw new Error(`unknown shape type: ${type}`);
    }
  }

  private requireArity(
    type: string,
    parameters: readonly string[],
    expected: number,
  ): void {
    if (parameters.length !== expected) {
      throw new Error(
        `${type} expects ${expected} parameter(s), received ${parameters.length}`,
      );
    }
  }

  private numberAt(
    parameters: readonly string[],
    index: number,
    name: string,
  ): number {
    const raw = this.valueAt(parameters, index);
    const value = Number(raw);

    if (!Number.isFinite(value)) {
      throw new Error(`invalid ${name}: ${raw}`);
    }

    return value;
  }

  private valueAt(parameters: readonly string[], index: number): string {
    const value = parameters[index];

    if (value === undefined) {
      throw new Error(`missing parameter at position ${index + 1}`);
    }

    return value;
  }
}