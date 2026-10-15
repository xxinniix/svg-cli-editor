import { describe, expect, it } from "vitest";
import { Editor } from "../../src/app/Editor.js";
import { CommandRunner } from "../../src/cli/CommandRunner.js";

describe("group command", () => {
  it("groups shapes and supports undo and redo", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create rect r1 10 20 30 40");
    runner.execute("create circle c1 100 100 20");

    expect(runner.execute("group g1 r1 c1")).toBe(
      "grouped 2 shape(s) as g1",
    );
    expect(runner.execute("show")).toContain('<g id="g1"><rect id="r1"');

    runner.execute("undo");
    expect(runner.execute("show")).not.toContain('<g id="g1">');
    expect(runner.execute("show")).toContain('<circle id="c1"');

    runner.execute("redo");
    expect(runner.execute("show")).toContain('<g id="g1"><rect id="r1"');
  });

  it("keeps the original sibling order inside the new group", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create rect r1 0 0 10 10");
    runner.execute("create rect r2 20 0 10 10");
    runner.execute("create rect r3 40 0 10 10");
    runner.execute("group g1 r1 r3");

    const svg = runner.execute("show");
    expect(svg.indexOf('id="r1"')).toBeLessThan(svg.indexOf('id="r3"'));
    expect(svg.indexOf('id="g1"')).toBeLessThan(svg.indexOf('id="r2"'));
  });

  it("groups shapes from different parents", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create g existing");
    runner.execute("create rect child 0 0 10 10");
    runner.execute("create rect root 20 0 10 10");
    runner.execute("addto existing child");

    expect(runner.execute("group g1 child root")).toBe(
      "grouped 2 shape(s) as g1",
    );
    expect(runner.execute("show")).toContain('<g id="existing"><g id="g1">');
  });

  it("rejects selecting a group together with one of its descendants", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create g parent");
    runner.execute("create rect child 0 0 10 10 in parent");

    expect(runner.execute("group invalid parent child")).toBe(
      "error: cannot group a container into its own descendant: parent",
    );
  });
});
