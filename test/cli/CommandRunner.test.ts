import { describe, expect, it } from "vitest";
import { Editor } from "../../src/app/Editor.js";
import { CommandRunner } from "../../src/cli/CommandRunner.js";

describe("CommandRunner", () => {
  it("requires a document before creating a shape", () => {
    const runner = new CommandRunner(new Editor());

    expect(runner.execute("create rect r1 10 20 30 40")).toBe(
      "error: no document. use 'init' or 'read' first",
    );
  });

  it("creates a styled rectangle and displays it as SVG", () => {
    const runner = new CommandRunner(new Editor());

    expect(runner.execute("init 300 200")).toBe("canvas 300x200 created");
    expect(runner.execute("create rect r1 10 20 30 40 fill=red")).toBe(
      "created rect#r1",
    );

    const svg = runner.execute("show");
    expect(svg).toContain("<rect");
    expect(svg).toContain('id="r1"');
    expect(svg).toContain('fill="red"');
  });

  it("supports quoted text and leaves the document unchanged after an error", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    expect(
      runner.execute('create text title 20 40 "Hello SVG" fill=blue'),
    ).toBe("created text#title");
    expect(runner.execute("create circle c1 10 10 5 fill=")).toBe(
      "error: attributes must use name=value",
    );

    const svg = runner.execute("show");
    expect(svg).toContain("Hello SVG");
    expect(svg).toContain('fill="blue"');
    expect(svg).not.toContain('id="c1"');
  });

  it("creates shapes in a specified container and accepts positional style", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create g scene");

    expect(runner.execute("create rect r1 10 20 30 40 #4a90d9 in scene")).toBe(
      "created rect#r1 in g#scene",
    );
    expect(runner.execute("show r1")).toBe([
      "rect#r1  parent=g#scene",
      "  x=10 y=20 w=30 h=40 fill=#4a90d9",
    ].join("\n"));
    expect(runner.execute("create rect r2 0 0 1 1 in missing")).toBe(
      "error: no such container: missing",
    );
  });
});
