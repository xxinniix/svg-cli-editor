import { describe, expect, it } from "vitest";
import { SvgDocument } from "../../src/model/SvgDocument.js";
import { Circle } from "../../src/model/shapes/Circle.js";
import { Group } from "../../src/model/shapes/Group.js";
import { Rect } from "../../src/model/shapes/Rect.js";

describe("SvgDocument", () => {
  it("stores the canvas and serializes root shapes", () => {
    const document = new SvgDocument(400, 200);
    document.addShape(new Rect("r1", 10, 20, 100, 50, "#eee"));

    expect(document.getShapeCount()).toBe(1);
    expect(document.toSvg()).toBe([
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">',
      '  <rect id="r1" x="10" y="20" width="100" height="50" fill="#eee"/>',
      "</svg>",
    ].join("\n"));
  });

  it("finds nested shapes and prevents duplicate ids", () => {
    const document = new SvgDocument(800, 600);
    const group = new Group("g1");
    const circle = new Circle("c1", 100, 100, 20);

    document.addShape(group);
    document.addShape(circle, group);

    expect(document.findShape("c1")).toBe(circle);
    expect(document.getShapeCount()).toBe(2);

    expect(() => {
      document.addShape(new Rect("c1", 0, 0, 10, 10));
    }).toThrow("id already exists: c1");
  });

  it("removes a shape by id", () => {
    const document = new SvgDocument(800, 600);
    const rect = new Rect("r1", 0, 0, 10, 10);

    document.addShape(rect);

    expect(document.removeShape("r1")).toBe(rect);
    expect(document.getRootShapes()).toHaveLength(0);
    expect(() => document.removeShape("r1")).toThrow(
      "no such shape: r1",
    );
  });
});