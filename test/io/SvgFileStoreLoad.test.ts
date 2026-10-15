import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SvgFileStore } from "../../src/io/SvgFileStore.js";

function createTemporaryFile(contents: string): {
  directory: string;
  filePath: string;
} {
  const directory = mkdtempSync(join(tmpdir(), "svg-cli-editor-read-"));
  const filePath = join(directory, "drawing.svg");

  writeFileSync(filePath, contents, "utf8");

  return {
    directory,
    filePath,
  };
}

describe("SvgFileStore.load", () => {
  it("loads nested shapes, styles, and escaped text", () => {
    const temporary = createTemporaryFile([
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">',
      '  <g id="g1" fill="red"><rect id="r1" x="10" y="20" width="30" height="40"/></g>',
      '  <text id="title" x="20" y="40">Hello &amp; SVG</text>',
      "</svg>",
    ].join("\n"));

    try {
      const result = new SvgFileStore().load(temporary.filePath);

      expect(result.warnings).toEqual([]);
      expect(result.document.getWidth()).toBe(300);
      expect(result.document.getHeight()).toBe(200);
      expect(result.document.findShape("r1")?.getParent()?.getId()).toBe("g1");
      expect(result.document.toSvg()).toContain(
        '<g id="g1" fill="red"><rect id="r1" x="10" y="20" width="30" height="40"/></g>',
      );
      expect(result.document.toSvg()).toContain(
        '<text id="title" x="20" y="40">Hello &amp; SVG</text>',
      );
    } finally {
      rmSync(temporary.directory, { recursive: true, force: true });
    }
  });

  it("assigns a warning and generated id to an imported shape without an id", () => {
    const temporary = createTemporaryFile([
      '<svg width="100" height="80">',
      '  <circle cx="10" cy="20" r="5"/>',
      "</svg>",
    ].join("\n"));

    try {
      const result = new SvgFileStore().load(temporary.filePath);

      expect(result.warnings).toEqual([
        "missing id on <circle>; assigned circle-1",
      ]);
      expect(result.document.findShape("circle-1")?.getType()).toBe("circle");
    } finally {
      rmSync(temporary.directory, { recursive: true, force: true });
    }
  });

  it("rejects invalid imported SVG", () => {
    const temporary = createTemporaryFile([
      '<svg width="100" height="80">',
      '  <rect id="r1" x="0" y="0" width="10"/>',
      "</svg>",
    ].join("\n"));

    try {
      expect(() => new SvgFileStore().load(temporary.filePath)).toThrow(
        "missing height on <rect>",
      );
    } finally {
      rmSync(temporary.directory, { recursive: true, force: true });
    }
  });
});