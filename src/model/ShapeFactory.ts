import { Circle } from "./shapes/Circle.js";
import { Ellipse } from "./shapes/Ellipse.js";
import { Group } from "./shapes/Group.js";
import { Line } from "./shapes/Line.js";
import { Rect } from "./shapes/Rect.js";
import { Shape } from "./shapes/Shape.js";
import { Text } from "./shapes/Text.js";

type ShapeSpecification = {
  readonly commandParameterCount: number;
  readonly svgAttributeNames: readonly string[];
  readonly optionalSvgAttributeNames: readonly string[];
  readonly acceptsTextContent: boolean;
  readonly create: (id: string, parameters: readonly string[]) => Shape;
};

/**
 * The one registry that translates a supported SVG type name into a concrete
 * Shape class. Keeping that decision here avoids tag-name dispatch throughout
 * the rest of the application.
 */
export class ShapeFactory {
  private readonly specifications = new Map<string, ShapeSpecification>([
    ["rect", {
      commandParameterCount: 4,
      svgAttributeNames: ["x", "y", "width", "height"],
      optionalSvgAttributeNames: [],
      acceptsTextContent: false,
      create: (id, parameters) => new Rect(
        id,
        this.numberAt(parameters, 0, "x"),
        this.numberAt(parameters, 1, "y"),
        this.numberAt(parameters, 2, "width"),
        this.numberAt(parameters, 3, "height"),
      ),
    }],
    ["circle", {
      commandParameterCount: 3,
      svgAttributeNames: ["cx", "cy", "r"],
      optionalSvgAttributeNames: [],
      acceptsTextContent: false,
      create: (id, parameters) => new Circle(
        id,
        this.numberAt(parameters, 0, "cx"),
        this.numberAt(parameters, 1, "cy"),
        this.numberAt(parameters, 2, "r"),
      ),
    }],
    ["ellipse", {
      commandParameterCount: 4,
      svgAttributeNames: ["cx", "cy", "rx", "ry"],
      optionalSvgAttributeNames: [],
      acceptsTextContent: false,
      create: (id, parameters) => new Ellipse(
        id,
        this.numberAt(parameters, 0, "cx"),
        this.numberAt(parameters, 1, "cy"),
        this.numberAt(parameters, 2, "rx"),
        this.numberAt(parameters, 3, "ry"),
      ),
    }],
    ["line", {
      commandParameterCount: 4,
      svgAttributeNames: ["x1", "y1", "x2", "y2"],
      optionalSvgAttributeNames: [],
      acceptsTextContent: false,
      create: (id, parameters) => new Line(
        id,
        this.numberAt(parameters, 0, "x1"),
        this.numberAt(parameters, 1, "y1"),
        this.numberAt(parameters, 2, "x2"),
        this.numberAt(parameters, 3, "y2"),
      ),
    }],
    ["text", {
      commandParameterCount: 3,
      svgAttributeNames: ["x", "y"],
      optionalSvgAttributeNames: ["text-anchor", "font-size"],
      acceptsTextContent: true,
      create: (id, parameters) => new Text(
        id,
        this.numberAt(parameters, 0, "x"),
        this.numberAt(parameters, 1, "y"),
        this.valueAt(parameters, 2),
      ),
    }],
    ["g", {
      commandParameterCount: 0,
      svgAttributeNames: [],
      optionalSvgAttributeNames: ["transform"],
      acceptsTextContent: false,
      create: (id, parameters) => {
        this.requireArity("g", parameters, 0);
        return new Group(id);
      },
    }],
  ]);

  public getParameterCount(type: string): number {
    return this.getSpecification(type).commandParameterCount;
  }

  public getSvgAttributeNames(type: string): readonly string[] {
    return this.getSpecification(type).svgAttributeNames;
  }

  public getOptionalSvgAttributeNames(type: string): readonly string[] {
    return this.getSpecification(type).optionalSvgAttributeNames;
  }

  public acceptsTextContent(type: string): boolean {
    return this.getSpecification(type).acceptsTextContent;
  }

  public create(type: string, id: string, parameters: readonly string[]): Shape {
    const specification = this.getSpecification(type);

    this.requireArity(type, parameters, specification.commandParameterCount);
    return specification.create(id, parameters);
  }

  public createFromSvg(
    type: string,
    id: string,
    attributes: ReadonlyMap<string, string>,
    textContent: string | undefined,
  ): Shape {
    const specification = this.getSpecification(type);
    const parameters = specification.svgAttributeNames.map((name) => {
      const value = attributes.get(name);

      if (value === undefined) {
        throw new Error(`missing ${name} on <${type}>`);
      }

      return value;
    });

    if (specification.acceptsTextContent) {
      if (textContent === undefined) {
        throw new Error("missing text content on <text>");
      }

      parameters.push(textContent);
    }

    return this.create(type, id, parameters);
  }

  private getSpecification(type: string): ShapeSpecification {
    const specification = this.specifications.get(type);

    if (specification === undefined) {
      throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    }

    return specification;
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
