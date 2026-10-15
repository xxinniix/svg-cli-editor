import { describe, expect, it } from "vitest";
import { Editor } from "../../src/app/Editor.js";
import { CommandRunner } from "../../src/cli/CommandRunner.js";

describe("tree command", () => {
  it("displays root shapes and nested group children", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init 300 200");
    runner.execute("create g g1");
    runner.execute("create rect r1 10 20 30 40");
    runner.execute("addto r1 g1");

    expect(runner.execute("tree")).toBe(
      [
        "svg 300x200",
        "  g#g1",
        "    rect#r1 x=10 y=20 w=30 h=40",
      ].join("\n"),
    );
  });

  it("shows an empty document tree", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");

    expect(runner.execute("tree")).toBe("svg 800x600");
  });

  it("validates tree command arguments and document state", () => {
    const runner = new CommandRunner(new Editor());

    expect(runner.execute("tree")).toBe(
      "error: no document. use 'init' or 'read' first",
    );

    runner.execute("init");
    expect(runner.execute("tree extra")).toBe("error: usage: tree");
  });
});