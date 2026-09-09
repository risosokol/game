export enum TileType {
  GRASS = 'grass',
  ROAD = 'road',
  PLAZA = 'plaza',
  PARK = 'park',
  PATH = 'path',
  RAIL = 'rail',
  WATER = 'water',
}

/** Simple 2D grid of tile types, in tile-space. Kept separate from Phaser so
 * it can be unit-reasoned-about and rasterized independently of rendering. */
export class TileGrid {
  readonly width: number;
  readonly height: number;
  private cells: TileType[];

  constructor(width: number, height: number, fill: TileType = TileType.GRASS) {
    this.width = width;
    this.height = height;
    this.cells = new Array(width * height).fill(fill);
  }

  private idx(x: number, y: number): number {
    return y * this.width + x;
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  get(x: number, y: number): TileType {
    if (!this.inBounds(x, y)) return TileType.GRASS;
    return this.cells[this.idx(x, y)];
  }

  set(x: number, y: number, type: TileType): void {
    if (!this.inBounds(x, y)) return;
    this.cells[this.idx(x, y)] = type;
  }

  fillRect(x0: number, y0: number, x1: number, y1: number, type: TileType): void {
    const minX = Math.max(0, Math.floor(Math.min(x0, x1)));
    const maxX = Math.min(this.width - 1, Math.ceil(Math.max(x0, x1)));
    const minY = Math.max(0, Math.floor(Math.min(y0, y1)));
    const maxY = Math.min(this.height - 1, Math.ceil(Math.max(y0, y1)));
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        this.set(x, y, type);
      }
    }
  }

  /** Draws an axis-aligned thick line (a street segment) in tile space. */
  strokeSegment(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    thickness: number,
    type: TileType,
  ): void {
    const half = thickness / 2;
    if (y0 === y1) {
      this.fillRect(Math.min(x0, x1), y0 - half, Math.max(x0, x1), y0 + half, type);
    } else if (x0 === x1) {
      this.fillRect(x0 - half, Math.min(y0, y1), x0 + half, Math.max(y0, y1), type);
    } else {
      // generic thick line via simple stepping (only used for the rail spur)
      const steps = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        this.fillRect(x - half, y - half, x + half, y + half, type);
      }
    }
  }

  isWalkable(x: number, y: number): boolean {
    const t = this.get(x, y);
    return t !== TileType.WATER;
  }
}
