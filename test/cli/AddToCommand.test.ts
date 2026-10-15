import { describe, expect, it } from "vitest";
import { Editor } from "../../src/app/Editor.js";
import { CommandRunner } from "../../src/cli/CommandRunner.js";

describe("addto command", () => {
  it("moves a shape into a group and supports undo and redo", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create g g1");
    runner.execute("create rect r1 10 20 30 40");

    expect(runner.execute("addto g1 r1")).toBe("added r1 to g1");
    expect(runner.execute("show")).toContain('<g id="g1"><rect id="r1"');

    runner.execute("undo");
    expect(runner.execute("show")).not.toContain('<g id="g1"><rect id="r1"');
    expect(runner.execute("show")).toContain('<rect id="r1"');

    runner.execute("redo");
    expect(runner.execute("show")).toContain('<g id="g1"><rect id="r1"');
  });

  it("rejects a target that is not a group", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create rect r1 10 20 30 40");
    runner.execute("create rect r2 50 60 30 40");

    expect(runner.execute("addto r2 r1")).toBe(
      "error: not a container: r2",
    );
  });

  it("rejects moving a group into its own descendant", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create g outer");
    runner.execute("create g inner");
    runner.execute("addto outer inner");

    expect(runner.execute("addto inner outer")).toBe(
      "error: cannot move a group into its own descendant",
    );
  });
});
