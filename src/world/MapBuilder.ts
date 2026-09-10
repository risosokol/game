import { TileGrid, TileType } from './TileGrid';
import { GRID_WIDTH, GRID_HEIGHT, roads, railway, plazas, areaPolygons } from './cityLayout';

export function buildTileGrid(): TileGrid {
  const grid = new TileGrid(GRID_WIDTH, GRID_HEIGHT, TileType.GRASS);

  for (const area of areaPolygons) {
    const pts = area.points.map(([x, y]) => ({ x, y }));
    grid.fillPolygon(pts, area.type);
  }
  for (const seg of roads) {
    grid.strokeSegment(seg.x0, seg.y0, seg.x1, seg.y1, seg.thickness, seg.type ?? TileType.ROAD);
  }
  for (const area of plazas) {
    grid.fillRect(area.x0, area.y0, area.x1, area.y1, area.type);
  }
  for (const seg of railway) {
    grid.strokeSegment(seg.x0, seg.y0, seg.x1, seg.y1, seg.thickness, seg.type ?? TileType.RAIL);
  }

  return grid;
}
