/**
 * Hand-placed ambient decoration (benches, lamps, trees, etc.). Unlike
 * cityLayout.ts this file is NOT auto-generated — it's small, and needs a
 * human eye for "does this look nice here" — but every position is still
 * computed relative to real landmark anchors or a real point (the Marian
 * column) rather than eyeballed absolute numbers, so it stays sensible if
 * the underlying data is regenerated with a shifted bounding box.
 */
import { landmarkAnchors } from '@/data/landmarkAnchors.generated';
import { project } from '@/geo/GeoTransform';

export interface PropSpawn {
  type: 'tree' | 'lamp' | 'bench' | 'busstop' | 'flowerbed' | 'fountain' | 'sign' | 'bike' | 'car' | 'noticeboard' | 'monument';
  x: number;
  y: number;
}

function near(id: string, dx: number, dy: number): { x: number; y: number } {
  const a = landmarkAnchors[id];
  return { x: a.tileX + dx, y: a.tileY + dy };
}

// Mariánsky stĺp (Marian column, historic=memorial) — real coordinates,
// standing between the two churches on Mariánske námestie.
const marianColumn = project({ lat: 48.6227607, lon: 21.7203048 });

export const props: PropSpawn[] = [
  // Manor park: benches, lamps, a fountain-style decorative feature, trees
  { type: 'bench', ...near('andrassy_manor', -6, 3) },
  { type: 'bench', ...near('mestsky_park', 4, 2) },
  { type: 'lamp', ...near('andrassy_manor', -8, 1) },
  { type: 'lamp', ...near('andrassy_manor', 8, 3) },
  { type: 'fountain', ...near('mestsky_park', -3, -2) },
  { type: 'flowerbed', ...near('andrassy_manor', 2, 4) },
  { type: 'tree', ...near('mestsky_park', -8, 4) },
  { type: 'tree', ...near('mestsky_park', 8, -3) },
  { type: 'tree', ...near('mestsky_park', -4, 8) },
  { type: 'tree', ...near('andrassy_manor', -10, -2) },
  { type: 'tree', ...near('andrassy_manor', 10, -4) },
  { type: 'tree', ...near('koniaren_gallery', 4, 3) },

  // Mariánske námestie — the square between the two churches
  { type: 'monument', x: Math.round(marianColumn.tileX), y: Math.round(marianColumn.tileY) },
  { type: 'bench', ...near('parish_church', -5, 2) },
  { type: 'bench', ...near('greekcatholic_church', 5, 2) },
  { type: 'lamp', ...near('parish_church', -6, -1) },
  { type: 'lamp', ...near('greekcatholic_church', 6, -1) },
  { type: 'noticeboard', ...near('parish_church', 3, 4) },
  { type: 'tree', ...near('parish_church', -3, 5) },
  { type: 'tree', ...near('greekcatholic_church', 3, 5) },

  // Town hall / civic cluster
  { type: 'lamp', ...near('town_hall', -4, 1) },
  { type: 'lamp', ...near('town_hall', 4, 1) },
  { type: 'bike', ...near('town_hall', 2, 3) },
  { type: 'sign', ...near('culture_centre', -3, 2) },
  { type: 'noticeboard', ...near('culture_centre', 3, 2) },

  // Andrássy mausoleum & Parič ruins — quiet, minimal dressing
  { type: 'tree', ...near('andrassy_mausoleum', -3, 2) },
  { type: 'tree', ...near('andrassy_mausoleum', 3, 2) },
  { type: 'tree', ...near('paric_castle', -4, 1) },
  { type: 'tree', ...near('paric_castle', 4, 3) },

  // Station forecourt
  { type: 'lamp', ...near('train_station', -6, 2) },
  { type: 'lamp', ...near('train_station', 6, 2) },
  { type: 'busstop', ...near('train_station', 0, 4) },
  { type: 'sign', ...near('train_station', -3, 4) },
  { type: 'car', ...near('train_station', -8, 4) },
  { type: 'car', ...near('train_station', 8, 4) },
];
