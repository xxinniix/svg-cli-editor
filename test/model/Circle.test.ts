import { describe, expect, it } from "vitest";
import { Circle } from "../../src/model/shapes/Circle.js";

describe("Circle", () => {
  it("creates an SVG circle", () => {
    const circle = new Circle("c1", 100, 80, 20, "red");

    expect(circle.toSvg()).toBe(
      '<circle id="c1" cx="100" cy="80" r="20" fill="red"/>',
    );
  });

  it("moves and scales all circle geometry", () => {
    const circle = new Circle("c1", 100, 80, 20);

    circle.move(10, -20);
    circle.scale(2);

    expect(circle.describe()).toBe("circle#c1 cx=220 cy=120 r=40");
  });

  it("updates allowed attributes and rejects unknown attributes", () => {
    const circle = new Circle("c1", 100, 80, 20);

    circle.setAttribute("r", "30");
    circle.setAttribute("stroke", "black");

    expect(circle.toSvg()).toBe(
      '<circle id="c1" cx="100" cy="80" r="30" stroke="black"/>',
    );

    expect(() => circle.setAttribute("width", "10")).toThrow(
      "unknown attribute: width",
    );
  });
});