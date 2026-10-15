import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Editor } from "../../src/app/Editor.js";
import { CommandRunner } from "../../src/cli/CommandRunner.js";

describe("save command", () => {
  it("saves the current document", () => {
    const directory = mkdtempSync(join(tmpdir(), "svg-cli-editor-"));
    const filePath = join(directory, "drawing.svg");
    const runner = new CommandRunner(new Editor());

    try {
      runner.execute("init 300 200");
      runner.execute("create rect r1 10 20 30 40 fill=red");

      expect(runner.execute(`save ${filePath}`)).toBe(`saved ${filePath}`);
      expect(readFileSync(filePath, "utf8")).toContain('id="r1"');
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("requires an existing document", () => {
    const runner = new CommandRunner(new Editor());

    expect(runner.execute("save drawing.svg")).toBe(
      "error: no document. use 'init' or 'read' first",
    );
  });

  it("validates the command arguments", () => {
    const runner = new CommandRunner(new Editor());

    expect(runner.execute("save")).toBe("error: usage: save <file>");
    expect(runner.execute("save one.svg two.svg")).toBe(
      "error: usage: save <file>",
    );
  });
});