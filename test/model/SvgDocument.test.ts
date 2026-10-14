import { describe, expect, it } from "vitest";
import { SvgDocument } from "../../src/model/SvgDocument.js";
import { Circle } from "../../src/model/shapes/Circle.js";
import { Group } from "../../src/model/shapes/Group.js";
import { Rect } from "../../src/model/shapes/Rect.js";

describe("SvgDocument", () => {
  it("stores the canvas and serializes root shapes", () => {
    const document = new SvgDocument(400, 200);
    document.addShape(new Rect("r1", 10, 20, 30, 40, "red"));

    expect(document.getWidth()).toBe(400);
    expect(document.getHeight()).toBe(200);
    expect(document.toSvg()).toContain('<rect id="r1"');
    expect(document.toSvg()).toContain('fill="red"');
  });

  it("finds nested shapes and prevents duplicate ids", () => {
    const document = new SvgDocument(400, 200);
    const group = new Group("g1");
    const circle = new Circle("c1", 10, 20, 5);

    document.addShape(group);
    document.addShape(circle, group);

    expect(document.findShape("g1")).toBe(group);
    expect(document.findShape("c1")).toBe(circle);
    expect(document.getShapeCount()).toBe(2);
    expect(() => {
      document.addShape(new Rect("c1", 0, 0, 1, 1));
    }).toThrow("id already exists: c1");
  });

  it("removes a shape by id", () => {
    const document = new SvgDocument(400, 200);
    const rectangle = new Rect("r1", 10, 20, 30, 40);

    document.addShape(rectangle);

    expect(document.removeShape("r1")).toBe(rectangle);
    expect(document.findShape("r1")).toBeUndefined();
    expect(() => document.removeShape("r1")).toThrow("no such shape: r1");
  });

  it("writes a standards-compliant viewBox", () => {
    const document = new SvgDocument(300, 200);

    expect(document.toSvg()).toContain('viewBox="0 0 300 200"');
  });
});