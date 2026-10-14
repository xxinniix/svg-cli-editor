import { describe, expect, it } from "vitest";
import { Editor } from "../../src/app/Editor.js";
import { CommandRunner } from "../../src/cli/CommandRunner.js";

describe("set command", () => {
  it("changes a geometry attribute and supports undo and redo", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create rect r1 10 20 30 40");
    expect(runner.execute("set r1 width 100")).toBe("set r1 width=100");
    expect(runner.execute("show")).toContain('width="100"');

    runner.execute("undo");
    expect(runner.execute("show")).toContain('width="30"');

    runner.execute("redo");
    expect(runner.execute("show")).toContain('width="100"');
  });

  it("removes a newly added style when the command is undone", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create circle c1 10 20 5");
    runner.execute("set c1 fill blue");

    expect(runner.execute("show")).toContain('fill="blue"');

    runner.execute("undo");
    expect(runner.execute("show")).not.toContain('fill="blue"');
  });

  it("supports quoted text values and rejects unknown attributes", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute('create text t1 10 20 "Old title"');
    expect(runner.execute('set t1 text "New title"')).toBe(
      "set t1 text=New title",
    );
    expect(runner.execute("show")).toContain(">New title</text>");

    expect(runner.execute("set t1 unknown value")).toBe(
      "error: unknown attribute: unknown",
    );
    expect(runner.execute("show")).toContain(">New title</text>");
  });
});