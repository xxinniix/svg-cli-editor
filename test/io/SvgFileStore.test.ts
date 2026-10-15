import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SvgFileStore } from "../../src/io/SvgFileStore.js";
import { SvgDocument } from "../../src/model/SvgDocument.js";

describe("SvgFileStore", () => {
  it("writes a complete SVG document to a file", () => {
    const directory = mkdtempSync(join(tmpdir(), "svg-cli-editor-"));
    const filePath = join(directory, "drawing.svg");

    try {
      const document = new SvgDocument(300, 200);
      new SvgFileStore().save(document, filePath);

      expect(readFileSync(filePath, "utf8")).toContain(
        'viewBox="0 0 300 200"',
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("overwrites an existing SVG file", () => {
    const directory = mkdtempSync(join(tmpdir(), "svg-cli-editor-"));
    const filePath = join(directory, "drawing.svg");
    const store = new SvgFileStore();

    try {
      store.save(new SvgDocument(100, 100), filePath);
      store.save(new SvgDocument(400, 300), filePath);

      expect(readFileSync(filePath, "utf8")).toContain(
        'viewBox="0 0 400 300"',
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("rejects an empty file path", () => {
    const document = new SvgDocument(100, 100);

    expect(() => new SvgFileStore().save(document, "   ")).toThrow(
      "file path must not be empty",
    );
  });
});