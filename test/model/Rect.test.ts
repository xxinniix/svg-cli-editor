import { describe, expect, it } from "vitest";
import { Rect } from "../../src/model/shapes/Rect.js";

describe("Rect", () => {
  it("creates an SVG rectangle", () => {
    const rect = new Rect("r1", 10, 20, 100, 50, "#eee");

    expect(rect.describe()).toBe(
      "rect#r1 x=10 y=20 w=100 h=50 fill=#eee",
    );

    expect(rect.toSvg()).toBe(
      '<rect id="r1" x="10" y="20" width="100" height="50" fill="#eee"/>',
    );
  });

  it("moves and scales all rectangle geometry", () => {
    const rect = new Rect("r1", 10, 20, 100, 50, "#eee");

    rect.move(5, -10);
    rect.scale(2);

    expect(rect.describe()).toBe(
      "rect#r1 x=30 y=20 w=200 h=100 fill=#eee",
    );
  });

  it("updates allowed attributes and rejects unknown attributes", () => {
    const rect = new Rect("r1", 10, 20, 100, 50);

    rect.setAttribute("width", "80");
    rect.setAttribute("stroke", "black");

    expect(rect.toSvg()).toBe(
      '<rect id="r1" x="10" y="20" width="80" height="50" stroke="black"/>',
    );

    expect(() => rect.setAttribute("radius", "10")).toThrow(
      "unknown attribute: radius",
    );
  });
});