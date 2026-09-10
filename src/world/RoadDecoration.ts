import Phaser from 'phaser';
import { TILE_SIZE, DEPTH } from '@/config/GameConfig';
import { Palette } from '@/assets/palette';
import { roads, RoadSegment } from './cityLayout';

/**
 * The base road TILE is just flat asphalt — fine as a fill, but it reads
 * as "gray blob" rather than "street" until it has a clear edge and a
 * centerline. Since every road tile is rasterized from real (arbitrarily
 * angled) OSM segment geometry rather than a fixed grid, baking edges
 * into the tileset itself would need a full autotile system; instead this
 * draws curb + centerline directly along each segment's real line, in
 * world-pixel space, as one static Graphics layer built once at scene
 * creation. Consecutive segments share exact endpoints (they're
 * decomposed from the same OSM way), so the curb lines join up cleanly
 * across segment boundaries even though each is drawn independently.
 */
export function renderRoadDecoration(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.setDepth(DEPTH.GROUND_DETAIL);

  for (const seg of roads) {
    drawCurb(g, seg);
  }
  for (const seg of roads) {
    if (seg.thickness >= 5) drawCenterline(g, seg);
  }

  return g;
}

function unitAndNormal(seg: RoadSegment): { ux: number; uy: number; nx: number; ny: number; len: number } {
  const dx = seg.x1 - seg.x0;
  const dy = seg.y1 - seg.y0;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return { ux, uy, nx: -uy, ny: ux, len };
}

function drawCurb(g: Phaser.GameObjects.Graphics, seg: RoadSegment): void {
  const { nx, ny } = unitAndNormal(seg);
  const half = (seg.thickness / 2) * TILE_SIZE;
  const x0 = seg.x0 * TILE_SIZE;
  const y0 = seg.y0 * TILE_SIZE;
  const x1 = seg.x1 * TILE_SIZE;
  const y1 = seg.y1 * TILE_SIZE;

  g.lineStyle(2.5, Palette.curbShadow, 0.5);
  for (const side of [-1, 1]) {
    g.beginPath();
    g.moveTo(x0 + nx * half * side, y0 + ny * half * side);
    g.lineTo(x1 + nx * half * side, y1 + ny * half * side);
    g.strokePath();
  }
  g.lineStyle(1.5, Palette.curb, 0.85);
  for (const side of [-1, 1]) {
    const inset = half - 1.5;
    g.beginPath();
    g.moveTo(x0 + nx * inset * side, y0 + ny * inset * side);
    g.lineTo(x1 + nx * inset * side, y1 + ny * inset * side);
    g.strokePath();
  }
}

function drawCenterline(g: Phaser.GameObjects.Graphics, seg: RoadSegment): void {
  const x0 = seg.x0 * TILE_SIZE;
  const y0 = seg.y0 * TILE_SIZE;
  const x1 = seg.x1 * TILE_SIZE;
  const y1 = seg.y1 * TILE_SIZE;
  g.lineStyle(1.5, Palette.roadLine, 0.55);
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  g.strokePath();
}
