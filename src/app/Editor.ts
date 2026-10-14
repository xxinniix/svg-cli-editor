import { ShapeFactory } from "../model/ShapeFactory.js";
import { SvgDocument } from "../model/SvgDocument.js";

export class Editor {
  private document: SvgDocument | null = null;
  private readonly shapeFactory = new ShapeFactory();

  public initialize(width = 800, height = 600): string {
    this.document = new SvgDocument(width, height);
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

    document.addShape(shape);
    return `created ${shape.getType()}#${shape.getId()}`;
  }

  public showSvg(): string {
    return this.getDocument().toSvg();
  }

  private applyAttribute(
    shape: ReturnType<ShapeFactory["create"]>,
    token: string,
  ): void {
    const equalsIndex = token.indexOf("=");

    if (equalsIndex <= 0 || equalsIndex === token.length - 1) {
      throw new Error("attributes must use name=value");
    }

    const attribute = token.slice(0, equalsIndex);
    const value = token.slice(equalsIndex + 1);
    shape.setAttribute(attribute, value);
  }

  private getDocument(): SvgDocument {
    if (this.document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    return this.document;
  }
}