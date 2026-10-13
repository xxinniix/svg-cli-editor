import { SvgDocument } from "../model/SvgDocument.js";

export class Editor {
  private document: SvgDocument | null = null;

  public initialize(width = 800, height = 600): string {
    this.document = new SvgDocument(width, height);
    return `canvas ${width}x${height} created`;
  }

  public showCanvas(): string {
    const document = this.getDocument();
    return `canvas ${document.getWidth()}x${document.getHeight()}`;
  }

  public resizeCanvas(width: number, height: number): string {
    const document = this.getDocument();
    document.resize(width, height);
    return `canvas resized to ${width}x${height}`;
  }

  private getDocument(): SvgDocument {
    if (this.document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    return this.document;
  }
}