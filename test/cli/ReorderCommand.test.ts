import { describe, expect, it } from "vitest";
import { Editor } from "../../src/app/Editor.js";
import { CommandRunner } from "../../src/cli/CommandRunner.js";

describe("front and back commands", () => {
  it("reorders root shapes with undo and redo", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create rect r1 0 0 10 10");
    runner.execute("create rect r2 20 0 10 10");
    expect(runner.execute("front r1")).toBe("brought r1 to front");

    const frontSvg = runner.execute("show");
    expect(frontSvg.indexOf('id="r2"')).toBeLessThan(
      frontSvg.indexOf('id="r1"'),
    );

    runner.execute("undo");
    const originalSvg = runner.execute("show");
    expect(originalSvg.indexOf('id="r1"')).toBeLessThan(
      originalSvg.indexOf('id="r2"'),
    );

    runner.execute("redo");
    const redoneSvg = runner.execute("show");
    expect(redoneSvg.indexOf('id="r2"')).toBeLessThan(
      redoneSvg.indexOf('id="r1"'),
    );
  });

  it("reorders children within the same group", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");
    runner.execute("create g g1");
    runner.execute("create rect r1 0 0 10 10");
    runner.execute("create rect r2 20 0 10 10");
    runner.execute("addto g1 r1");
    runner.execute("addto g1 r2");

    expect(runner.execute("back r2")).toBe("sent r2 to back");

    const svg = runner.execute("show");
    expect(svg.indexOf('id="r2"')).toBeLessThan(svg.indexOf('id="r1"'));
  });

  it("validates reordering ids and arguments", () => {
    const runner = new CommandRunner(new Editor());

    runner.execute("init");

    expect(runner.execute("front missing")).toBe(
      "error: no such shape: missing",
    );
    expect(runner.execute("back")).toBe("error: usage: back <id>");
  });
});
