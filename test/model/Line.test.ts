import { describe, expect, it } from "vitest";
import { Line } from "../../src/model/shapes/Line.js";

describe("Line", () => {
  it("creates an SVG line", () => {
    const line = new Line("l1", 100, 80, 200, 130, "black");

    expect(line.toSvg()).toBe(
      '<line id="l1" x1="100" y1="80" x2="200" y2="130" stroke="black"/>',
    );
  });

  it("moves and scales both endpoints", () => {
    const line = new Line("l1", 100, 80, 200, 130, "black");

    line.move(10, -20);
    line.scale(2);

    expect(line.describe()).toBe(
      "line#l1 (220,120) -> (420,220) stroke=black",
    );
  });

  it("updates allowed attributes and rejects unknown attributes", () => {
    const line = new Line("l1", 100, 80, 200, 130);

    line.setAttribute("x2", "250");
    line.setAttribute("stroke", "red");

    expect(line.toSvg()).toBe(
      '<line id="l1" x1="100" y1="80" x2="250" y2="130" stroke="red"/>',
    );

    expect(() => line.setAttribute("width", "10")).toThrow(
      "unknown attribute: width",
    );
  });
});