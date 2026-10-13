import { describe, expect, it } from "vitest";
import { Ellipse } from "../../src/model/shapes/Ellipse.js";

describe("Ellipse", () => {
  it("creates an SVG ellipse", () => {
    const ellipse = new Ellipse("e1", 100, 80, 40, 20, "blue");

    expect(ellipse.toSvg()).toBe(
      '<ellipse id="e1" cx="100" cy="80" rx="40" ry="20" fill="blue"/>',
    );
  });

  it("moves and scales all ellipse geometry", () => {
    const ellipse = new Ellipse("e1", 100, 80, 40, 20);

    ellipse.move(10, -20);
    ellipse.scale(2);

    expect(ellipse.describe()).toBe(
      "ellipse#e1 cx=220 cy=120 rx=80 ry=40",
    );
  });

  it("updates allowed attributes and rejects unknown attributes", () => {
    const ellipse = new Ellipse("e1", 100, 80, 40, 20);

    ellipse.setAttribute("rx", "60");
    ellipse.setAttribute("stroke", "black");

    expect(ellipse.toSvg()).toBe(
      '<ellipse id="e1" cx="100" cy="80" rx="60" ry="20" stroke="black"/>',
    );

    expect(() => ellipse.setAttribute("r", "10")).toThrow(
      "unknown attribute: r",
    );
  });
});