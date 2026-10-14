import { describe, expect, it } from "vitest";
import { Editor } from "../../src/app/Editor.js";
import { CommandRunner } from "../../src/cli/CommandRunner.js";

describe("ungroup command", () => {
  it("ungroups children and supports undo and redo", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create g g1");
    runner.execute("create rect r1 10 20 30 40");
    runner.execute("create circle c1 100 100 20");
    runner.execute("addto r1 g1");
    runner.execute("addto c1 g1");

    expect(runner.execute("ungroup g1")).toBe("ungrouped g1");
    expect(runner.execute("show")).not.toContain('id="g1"');
    expect(runner.execute("show")).toContain('id="r1"');
    expect(runner.execute("show")).toContain('id="c1"');

    runner.execute("undo");
    expect(runner.execute("show")).toContain('<g id="g1"><rect id="r1"');

    runner.execute("redo");
    expect(runner.execute("show")).not.toContain('id="g1"');
  });

  it("places ungrouped children into the parent group", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create g outer");
    runner.execute("create g inner");
    runner.execute("create rect r1 10 20 30 40");
    runner.execute("addto inner outer");
    runner.execute("addto r1 inner");

    runner.execute("ungroup inner");

    const svg = runner.execute("show");
    expect(svg).toContain('<g id="outer"><rect id="r1"');
    expect(svg).not.toContain('id="inner"');
  });

  it("rejects missing shapes and non-group shapes", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create rect r1 10 20 30 40");

    expect(runner.execute("ungroup missing")).toBe(
      "error: no such shape: missing",
    );
    expect(runner.execute("ungroup r1")).toBe(
      "error: shape is not a group: r1",
    );
  });
});