import { describe, expect, it } from "vitest";
import { Text } from "../../src/model/shapes/Text.js";

describe("Text", () => {
  it("creates an SVG text element and escapes its content", () => {
    const text = new Text("t1", 20, 40, "A & B");

    expect(text.toSvg()).toBe(
      '<text id="t1" x="20" y="40">A &amp; B</text>',
    );
  });

  it("moves and scales text coordinates", () => {
    const text = new Text("t1", 20, 40, "Hello");

    text.move(10, -20);
    text.scale(2);

    expect(text.describe()).toBe('text#t1 (60,40) "Hello"');
  });

  it("updates text content and rejects unknown attributes", () => {
    const text = new Text("t1", 20, 40, "Old");

    text.setAttribute("text", "New title");
    text.setAttribute("fill", "blue");

    expect(text.toSvg()).toBe(
      '<text id="t1" x="20" y="40" fill="blue">New title</text>',
    );

    expect(() => text.setAttribute("width", "10")).toThrow(
      "unknown attribute: width",
    );
  });
});