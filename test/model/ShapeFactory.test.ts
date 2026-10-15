import { describe, expect, it } from "vitest";
import { ShapeFactory } from "../../src/model/ShapeFactory.js";

describe("ShapeFactory", () => {
  it("creates every supported SVG shape type", () => {
    const factory = new ShapeFactory();

    expect(factory.create("rect", "r1", ["1", "2", "30", "40"]).getType()).toBe(
      "rect",
    );
    expect(factory.create("circle", "c1", ["1", "2", "3"]).getType()).toBe(
      "circle",
    );
    expect(
      factory.create("ellipse", "e1", ["1", "2", "3", "4"]).getType(),
    ).toBe("ellipse");
    expect(factory.create("line", "l1", ["1", "2", "3", "4"]).getType()).toBe(
      "line",
    );
    expect(factory.create("text", "t1", ["1", "2", "Hello"]).getType()).toBe(
      "text",
    );
    expect(factory.create("g", "g1", []).getType()).toBe("g");
  });

  it("creates text with its content", () => {
    const factory = new ShapeFactory();
    const text = factory.create("text", "title", ["20", "40", "Hello SVG"]);

    expect(text.toSvg()).toBe(
      '<text id="title" x="20" y="40">Hello SVG</text>',
    );
  });

  it("rejects unknown types, wrong parameter counts, and invalid numbers", () => {
    const factory = new ShapeFactory();

    expect(() => factory.create("polygon", "p1", [])).toThrow(
      "unknown shape type: polygon (is the plugin loaded?)",
    );
    expect(() => factory.create("rect", "r1", ["1", "2", "3"])).toThrow(
      "rect expects 4 parameter(s), received 3",
    );
    expect(() => factory.create("circle", "c1", ["x", "2", "3"])).toThrow(
      "invalid cx: x",
    );
  });
});
