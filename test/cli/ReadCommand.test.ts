import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Editor } from "../../src/app/Editor.js";
import { CommandRunner } from "../../src/cli/CommandRunner.js";

function createTemporaryFile(contents: string): {
  directory: string;
  filePath: string;
} {
  const directory = mkdtempSync(join(tmpdir(), "svg-cli-editor-read-command-"));
  const filePath = join(directory, "drawing.svg");

  writeFileSync(filePath, contents, "utf8");

  return {
    directory,
    filePath,
  };
}

describe("read command", () => {
  it("loads a document and clears the previous undo history", () => {
    const temporary = createTemporaryFile([
      '<svg width="300" height="200">',
      '  <circle id="c1" cx="100" cy="80" r="20" fill="blue"/>',
      "</svg>",
    ].join("\n"));

    try {
      const runner = new CommandRunner(new Editor());

      runner.execute("init 100 100");
      runner.execute("create rect old 0 0 10 10");

      expect(runner.execute(`read ${temporary.filePath}`)).toBe(
        `loaded ${temporary.filePath}`,
      );
      expect(runner.execute("canvas")).toBe("canvas 300x200");
      expect(runner.execute("show")).toContain(
        '<circle id="c1" cx="100" cy="80" r="20" fill="blue"/>',
      );
      expect(runner.execute("undo")).toBe(
        "error: undo not allowed after io command",
      );
    } finally {
      rmSync(temporary.directory, { recursive: true, force: true });
    }
  });

  it("prints warnings for shapes that receive imported ids", () => {
    const temporary = createTemporaryFile([
      '<svg width="100" height="80">',
      '  <rect x="1" y="2" width="3" height="4"/>',
      "</svg>",
    ].join("\n"));

    try {
      const runner = new CommandRunner(new Editor());

      expect(runner.execute(`read ${temporary.filePath}`)).toBe([
        `loaded ${temporary.filePath}`,
        "warning: assigned id rect1 to unnamed <rect>",
      ].join("\n"));
    } finally {
      rmSync(temporary.directory, { recursive: true, force: true });
    }
  });

  it("keeps the current document when reading fails", () => {
    const temporary = createTemporaryFile([
      '<svg width="100" height="80">',
      '  <rect id="bad" x="0" y="0" width="10"/>',
      "</svg>",
    ].join("\n"));

    try {
      const runner = new CommandRunner(new Editor());

      runner.execute("init");
      runner.execute("create rect keep 1 2 3 4");

      expect(runner.execute("read")).toBe("error: usage: read <file>");
      expect(runner.execute(`read ${temporary.filePath}`)).toBe(
        "error: missing height on <rect>",
      );
      expect(runner.execute("show")).toContain('id="keep"');
    } finally {
      rmSync(temporary.directory, { recursive: true, force: true });
    }
  });
});
