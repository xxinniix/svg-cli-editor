import { writeFileSync } from "node:fs";
import { SvgDocument } from "../model/SvgDocument.js";

export class SvgFileStore {
  public save(document: SvgDocument, filePath: string): void {
    if (filePath.trim() === "") {
      throw new Error("file path must not be empty");
    }

    writeFileSync(filePath, document.toSvg(), "utf8");
  }
}