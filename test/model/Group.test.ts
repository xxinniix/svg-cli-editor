import { describe, expect, it } from "vitest";
import { Circle } from "../../src/model/shapes/Circle.js";
import { Group } from "../../src/model/shapes/Group.js";
import { Rect } from "../../src/model/shapes/Rect.js";

describe("Group", () => {
  it("owns children and serializes them as SVG", () => {
    const group = new Group("g1");
    const rect = new Rect("r1", 10, 20, 100, 50, "#eee");

    group.addChild(rect);

    expect(rect.getParent()).toBe(group);
    expect(group.toSvg()).toBe(
      '<g id="g1"><rect id="r1" x="10" y="20" width="100" height="50" fill="#eee"/></g>',
    );
  });

  it("moves and scales every child", () => {
    const group = new Group("g1");
    const rect = new Rect("r1", 10, 20, 100, 50);
    const circle = new Circle("c1", 100, 100, 20);

    group.addChild(rect);
    group.addChild(circle);
    group.move(5, -10);
    group.scale(2);

    expect(group.getChildren().map((child) => child.describe())).toEqual([
      "rect#r1 x=30 y=20 w=200 h=100",
      "circle#c1 cx=210 cy=180 r=40",
    ]);
  });

  it("removes children and prevents cyclic groups", () => {
    const outer = new Group("outer");
    const inner = new Group("inner");
    const rect = new Rect("r1", 0, 0, 10, 10);

    outer.addChild(inner);
    outer.addChild(rect);
    outer.removeChild(rect);

    expect(rect.getParent()).toBeNull();
    expect(() => inner.addChild(outer)).toThrow(
      "cannot add a group to its own descendant",
    );
  });
});