import { ShapeFactory } from "../model/ShapeFactory.js";
import { SvgDocument } from "../model/SvgDocument.js";
import { Group } from "../model/shapes/Group.js";
import type { Shape } from "../model/shapes/Shape.js";

type XmlChild = XmlElement | string;

type XmlElement = {
  name: string;
  attributes: Map<string, string>;
  children: XmlChild[];
};

type ParseContext = {
  usedIds: Set<string>;
  nextIds: Map<string, number>;
  warnings: string[];
};

export type SvgParseResult = {
  document: SvgDocument;
  warnings: readonly string[];
};

export class SvgParser {
  private readonly shapeFactory = new ShapeFactory();

  public parse(source: string): SvgParseResult {
    const roots = this.parseXml(source);
    const root = roots[0];

    if (
      roots.length !== 1 ||
      root === undefined ||
      root.name !== "svg"
    ) {
      throw new Error("SVG document must have one <svg> root element");
    }

    const document = new SvgDocument(
      this.readCanvasDimension(root, "width"),
      this.readCanvasDimension(root, "height"),
    );

    const context: ParseContext = {
      usedIds: new Set<string>(),
      nextIds: new Map<string, number>(),
      warnings: [],
    };

    for (const child of root.children) {
      if (typeof child === "string") {
        this.requireWhitespaceOnly(child, "outside SVG shapes");
      } else {
        this.addElement(child, document, undefined, context);
      }
    }

    return {
      document,
      warnings: context.warnings,
    };
  }

  private addElement(
    element: XmlElement,
    document: SvgDocument,
    parent: Group | undefined,
    context: ParseContext,
  ): void {
    this.requireAllowedAttributes(element);

    const id = this.readOrCreateId(element, context);
    const shape = this.shapeFactory.createFromSvg(
      element.name,
      id,
      element.attributes,
      this.shapeFactory.acceptsTextContent(element.name)
        ? this.readTextContent(element)
        : undefined,
    );

    this.applyStyleAttributes(shape, element);
    document.addShape(shape, parent);

    if (shape instanceof Group) {
      for (const child of element.children) {
        if (typeof child === "string") {
          this.requireWhitespaceOnly(child, "inside <g>");
        } else {
          this.addElement(child, document, shape, context);
        }
      }

      this.applyGroupTransform(shape, element);

      return;
    }

    this.requireLeafElement(
      element,
      this.shapeFactory.acceptsTextContent(element.name),
    );
  }

  private applyStyleAttributes(shape: Shape, element: XmlElement): void {
    for (const name of [
      "fill",
      "stroke",
      "stroke-width",
      "text-anchor",
      "font-size",
    ]) {
      const value = element.attributes.get(name);

      if (value !== undefined) {
        shape.setAttribute(name, value);
      }
    }
  }

  private requireAllowedAttributes(element: XmlElement): void {
    const allowed = new Set<string>([
      "id",
      "fill",
      "stroke",
      "stroke-width",
      ...this.shapeFactory.getSvgAttributeNames(element.name),
      ...this.shapeFactory.getOptionalSvgAttributeNames(element.name),
    ]);

    for (const name of element.attributes.keys()) {
      if (!allowed.has(name)) {
        throw new Error(
          `unsupported attribute on <${element.name}>: ${name}`,
        );
      }
    }
  }

  private readTextContent(element: XmlElement): string {
    const pieces: string[] = [];

    for (const child of element.children) {
      if (typeof child !== "string") {
        throw new Error("<text> cannot contain nested SVG elements");
      }

      pieces.push(child);
    }

    return this.decodeXml(pieces.join(""));
  }

  private requireLeafElement(
    element: XmlElement,
    acceptsTextContent: boolean,
  ): void {
    if (acceptsTextContent) {
      return;
    }

    for (const child of element.children) {
      if (typeof child !== "string" || child.trim() !== "") {
        throw new Error(`<${element.name}> cannot contain child elements`);
      }
    }
  }

  private readOrCreateId(
    element: XmlElement,
    context: ParseContext,
  ): string {
    const declaredId = element.attributes.get("id");

    if (declaredId !== undefined) {
      if (declaredId.trim() === "") {
        throw new Error(`id on <${element.name}> must not be empty`);
      }

      this.claimId(declaredId, context);
      return declaredId;
    }

    let nextNumber = context.nextIds.get(element.name) ?? 1;
    let generatedId = `${element.name}${nextNumber}`;

    while (context.usedIds.has(generatedId)) {
      nextNumber += 1;
      generatedId = `${element.name}${nextNumber}`;
    }

    context.nextIds.set(element.name, nextNumber + 1);
    this.claimId(generatedId, context);
    context.warnings.push(
      `assigned id ${generatedId} to unnamed <${element.name}>`,
    );

    return generatedId;
  }

  private claimId(id: string, context: ParseContext): void {
    if (context.usedIds.has(id)) {
      throw new Error(`id already exists: ${id}`);
    }

    context.usedIds.add(id);
  }

  private readCanvasDimension(element: XmlElement, name: string): number {
    const value = Number(this.requireAttribute(element, name));

    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`SVG ${name} must be a positive number`);
    }

    return value;
  }

  private requireAttribute(element: XmlElement, name: string): string {
    const value = element.attributes.get(name);

    if (value === undefined) {
      throw new Error(`missing ${name} on <${element.name}>`);
    }

    return value;
  }

  /**
   * Normalizes the two group transforms described in the assignment into the
   * editable model. The saved SVG contains the resulting geometry instead of
   * retaining a hidden transform matrix.
   */
  private applyGroupTransform(group: Group, element: XmlElement): void {
    const source = element.attributes.get("transform");

    if (source === undefined) {
      return;
    }

    const operations: Array<{ name: "translate" | "scale"; values: number[] }> = [];
    const matcher = /(translate|scale)\s*\(([^)]*)\)/g;
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = matcher.exec(source)) !== null) {
      if (source.slice(cursor, match.index).trim() !== "") {
        throw new Error(`unsupported transform on <g>: ${source}`);
      }

      const name = match[1];
      const values = (match[2] ?? "")
        .trim()
        .split(/[\s,]+/)
        .filter((value) => value !== "")
        .map((value) => Number(value));

      if (
        (name !== "translate" && name !== "scale") ||
        values.some((value) => !Number.isFinite(value))
      ) {
        throw new Error(`unsupported transform on <g>: ${source}`);
      }

      if (
        (name === "translate" && (values.length < 1 || values.length > 2)) ||
        (name === "scale" && values.length !== 1)
      ) {
        throw new Error(`unsupported transform on <g>: ${source}`);
      }

      operations.push({ name, values });
      cursor = matcher.lastIndex;
    }

    if (operations.length === 0 || source.slice(cursor).trim() !== "") {
      throw new Error(`unsupported transform on <g>: ${source}`);
    }

    for (const operation of [...operations].reverse()) {
      const first = operation.values[0];

      if (first === undefined) {
        throw new Error(`unsupported transform on <g>: ${source}`);
      }

      if (operation.name === "scale") {
        group.scale(first);
      } else {
        group.move(first, operation.values[1] ?? 0);
      }
    }
  }

  private parseXml(source: string): XmlElement[] {
    const roots: XmlElement[] = [];
    const stack: XmlElement[] = [];
    const cleaned = source
      .replace(/^\uFEFF/, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    const tagPattern = /<[^>]+>/g;
    let previousIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagPattern.exec(cleaned)) !== null) {
      this.appendText(
        cleaned.slice(previousIndex, match.index),
        stack,
      );
      this.appendTag(match[0], stack, roots);
      previousIndex = tagPattern.lastIndex;
    }

    this.appendText(cleaned.slice(previousIndex), stack);

    if (stack.length !== 0) {
      throw new Error(`unclosed <${stack[stack.length - 1]?.name}> element`);
    }

    return roots;
  }

  private appendText(text: string, stack: XmlElement[]): void {
    if (text === "") {
      return;
    }

    const parent = stack[stack.length - 1];

    if (parent === undefined) {
      this.requireWhitespaceOnly(text, "outside the SVG document");
      return;
    }

    parent.children.push(text);
  }

  private appendTag(
    tag: string,
    stack: XmlElement[],
    roots: XmlElement[],
  ): void {
    if (tag.startsWith("<?") || tag.startsWith("<!--")) {
      return;
    }

    if (tag.startsWith("</")) {
      const name = tag.slice(2, -1).trim();

      if (!/^[A-Za-z][\w:-]*$/.test(name)) {
        throw new Error(`invalid closing tag: ${tag}`);
      }

      const openElement = stack.pop();

      if (openElement === undefined || openElement.name !== name) {
        throw new Error(`unexpected closing tag: </${name}>`);
      }

      return;
    }

    if (tag.startsWith("<!")) {
      throw new Error(`unsupported XML declaration: ${tag}`);
    }

    const inner = tag.slice(1, -1).trim();
    const selfClosing = inner.endsWith("/");
    const content = selfClosing
      ? inner.slice(0, -1).trimEnd()
      : inner;

    const parts = /^([A-Za-z][\w:-]*)([\s\S]*)$/.exec(content);

    if (parts === null) {
      throw new Error(`invalid opening tag: ${tag}`);
    }

    const name = parts[1];

    if (name === undefined) {
      throw new Error(`invalid opening tag: ${tag}`);
    }

    const element: XmlElement = {
      name,
      attributes: this.parseAttributes(parts[2] ?? ""),
      children: [],
    };

    const parent = stack[stack.length - 1];

    if (parent === undefined) {
      roots.push(element);
    } else {
      parent.children.push(element);
    }

    if (!selfClosing) {
      stack.push(element);
    }
  }

  private parseAttributes(source: string): Map<string, string> {
    const attributes = new Map<string, string>();
    const pattern =
      /\s*([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/y;

    let index = 0;

    while (index < source.length) {
      pattern.lastIndex = index;
      const match = pattern.exec(source);

      if (match === null) {
        if (source.slice(index).trim() === "") {
          break;
        }

        throw new Error("invalid XML attribute");
      }

      const name = match[1];

      if (name === undefined) {
        throw new Error("invalid XML attribute");
      }

      if (attributes.has(name)) {
        throw new Error(`duplicate XML attribute: ${name}`);
      }

      const value = match[2] ?? match[3] ?? "";
      attributes.set(name, this.decodeXml(value));
      index = pattern.lastIndex;
    }

    return attributes;
  }

  private requireWhitespaceOnly(text: string, location: string): void {
    if (text.trim() !== "") {
      throw new Error(`unexpected text ${location}`);
    }
  }

  private decodeXml(value: string): string {
    return value
      .replaceAll("&quot;", '"')
      .replaceAll("&apos;", "'")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&amp;", "&");
  }
}
