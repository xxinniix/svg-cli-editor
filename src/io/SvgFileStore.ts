import { readFileSync, writeFileSync } from "node:fs";
import { SvgDocument } from "../model/SvgDocument.js";
import { SvgParser } from "./SvgParser.js";
import type { SvgParseResult } from "./SvgParser.js";

export class SvgFileStore {
  private readonly parser = new SvgParser();

  public save(document: SvgDocument, filePath: string): void {
    if (filePath.trim() === "") {
      throw new Error("file path must not be empty");
    }

    try {
      writeFileSync(filePath, document.toSvg(), "utf8");
    } catch {
      throw new Error(`cannot write file: ${filePath}`);
    }
  }

  public load(filePath: string): SvgParseResult {
    if (filePath.trim() === "") {
      throw new Error("file path must not be empty");
    }

    let source: string;

    try {
      source = readFileSync(filePath, "utf8");
    } catch {
      throw new Error(`cannot read file: ${filePath}`);
    }

    return this.parser.parse(source);
  }
}
