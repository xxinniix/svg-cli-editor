import { describe, expect, it } from "vitest";
import { Editor } from "../../src/app/Editor.js";
import { CommandRunner } from "../../src/cli/CommandRunner.js";

describe("editing commands", () => {
  it("undoes and redoes shape creation", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create rect r1 10 20 30 40");

    expect(runner.execute("undo")).toBe("undid last command");
    expect(runner.execute("show")).not.toContain('id="r1"');

    expect(runner.execute("redo")).toBe("redid last command");
    expect(runner.execute("show")).toContain('id="r1"');
  });

  it("moves and scales a shape with undo and redo", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create rect r1 10 20 30 40");
    runner.execute("move r1 5 -10");
    runner.execute("scale r1 2");

    const scaledSvg = runner.execute("show");
    expect(scaledSvg).toContain('x="30"');
    expect(scaledSvg).toContain('y="20"');
    expect(scaledSvg).toContain('width="60"');
    expect(scaledSvg).toContain('height="80"');

    runner.execute("undo");
    const movedSvg = runner.execute("show");
    expect(movedSvg).toContain('x="15"');
    expect(movedSvg).toContain('y="10"');
    expect(movedSvg).toContain('width="30"');

    runner.execute("undo");
    const originalSvg = runner.execute("show");
    expect(originalSvg).toContain('x="10"');
    expect(originalSvg).toContain('y="20"');

    expect(runner.execute("redo")).toBe("redid last command");
  });

  it("reports invalid edit operations without creating history entries", () => {
    const runner = new CommandRunner(new Editor());

    expect(runner.execute("undo")).toBe(
      "error: no document. use 'init' or 'read' first",
    );

    runner.execute("init");
    runner.execute("create rect r1 10 20 30 40");

    expect(runner.execute("scale r1 0")).toBe(
      "error: scale factor must be positive",
    );
    expect(runner.execute("move missing 1 2")).toBe(
      "error: no such shape: missing",
    );
  });

  it("locks undo and redo after document commands until another edit", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    expect(runner.execute("undo")).toBe(
      "error: undo not allowed after io command",
    );
    expect(runner.execute("redo")).toBe(
      "error: redo not allowed after io command",
    );

    runner.execute("create rect r1 0 0 10 10");
    expect(runner.execute("undo")).toBe("undid last command");
  });
});
