import { describe, expect, it } from "vitest";
import { Editor } from "../../src/app/Editor.js";
import { CommandRunner } from "../../src/cli/CommandRunner.js";

describe("delete command", () => {
  it("deletes a shape and restores it with undo and redo", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create rect r1 10 20 30 40");
    runner.execute("create circle c1 50 60 10");

    expect(runner.execute("delete r1")).toBe("deleted r1");
    expect(runner.execute("show")).not.toContain('id="r1"');
    expect(runner.execute("show")).toContain('id="c1"');

    expect(runner.execute("undo")).toBe("undid last command");
    expect(runner.execute("show")).toContain('id="r1"');

    expect(runner.execute("redo")).toBe("redid last command");
    expect(runner.execute("show")).not.toContain('id="r1"');
  });

  it("restores the moved geometry when deletion is undone", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create rect r1 10 20 30 40");
    runner.execute("move r1 5 -10");
    runner.execute("delete r1");
    runner.execute("undo");

    const svg = runner.execute("show");
    expect(svg).toContain('id="r1"');
    expect(svg).toContain('x="15"');
    expect(svg).toContain('y="10"');
  });

  it("reports an error when the id does not exist", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");

    expect(runner.execute("delete missing")).toBe(
      "error: no such shape: missing",
    );
  });
});