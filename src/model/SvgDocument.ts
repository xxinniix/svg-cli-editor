export class SvgDocument {
  public constructor(
    private width: number,
    private height: number,
  ) {
    this.assertValidDimension(width);
    this.assertValidDimension(height);
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public resize(width: number, height: number): void {
    this.assertValidDimension(width);
    this.assertValidDimension(height);

    this.width = width;
    this.height = height;
  }

  private assertValidDimension(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("canvas dimensions must be positive numbers");
    }
  }
}