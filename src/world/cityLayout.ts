/**
 * Hand-authored vertical slice of central Trebišov.
 *
 * This is a game-friendly simplification, not a survey: streets are
 * straightened to axis-aligned segments and dense residential blocks are
 * abstracted into a few representative buildings, per the brief's
 * "simplify extremely dense or repetitive areas" guidance. Relative
 * placement and orientation of the real landmarks is preserved:
 *  - the main street (Štefánikova) runs roughly north-south through a
 *    central square,
 *  - the Andrássy manor and its English park sit west of the square,
 *  - the parish church, reformed church, town hall and synagogue cluster
 *    around/near the square,
 *  - the railway station lies to the south-east, reached by its own
 *    access road and a short rail spur.
 *
 * See src/geo/GeoTransform.ts for how/where to replace this with real
 * OSM-derived geometry later.
 */
import { TileType } from './TileGrid';

export const GRID_WIDTH = 140;
export const GRID_HEIGHT = 120;

export interface RoadSegment {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  thickness: number;
  type?: TileType;
}

export interface RectArea {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  type: TileType;
}

export type BuildingKind =
  | 'manor'
  | 'church'
  | 'townhall'
  | 'synagogue'
  | 'culturehouse'
  | 'station'
  | 'house'
  | 'shop'
  | 'chapel';

export interface BuildingFootprint {
  id: string;
  x: number; // top-left tile x
  y: number; // top-left tile y
  w: number; // width in tiles
  h: number; // height in tiles
  kind: BuildingKind;
  /** Rotate the roof ridge to run horizontally instead of vertically, for
   * purely visual variety. */
  roofHorizontal?: boolean;
}

export interface PropSpawn {
  type: 'tree' | 'lamp' | 'bench' | 'busstop' | 'flowerbed' | 'fountain' | 'sign' | 'bike' | 'car' | 'noticeboard';
  x: number;
  y: number;
}

// --- Streets -----------------------------------------------------------
export const roads: RoadSegment[] = [
  // Štefánikova — main north-south boulevard through the centre
  { x0: 70, y0: 8, x1: 70, y1: 112, thickness: 5 },
  // Komenského — east-west cross street north of the square
  { x0: 24, y0: 40, x1: 118, y1: 40, thickness: 4 },
  // M. R. Štefánika square cross street south of the square (SNP)
  { x0: 24, y0: 78, x1: 118, y1: 78, thickness: 4 },
  // Western avenue skirting the manor park
  { x0: 22, y0: 12, x1: 22, y1: 108, thickness: 4 },
  // Eastern avenue toward the station district
  { x0: 108, y0: 12, x1: 108, y1: 108, thickness: 4 },
  // Station access road (south-east spur)
  { x0: 108, y0: 78, x1: 108, y1: 96, thickness: 4 },
  { x0: 108, y0: 96, x1: 126, y1: 96, thickness: 4 },
  // Kalvária access lane
  { x0: 70, y0: 90, x1: 70, y1: 108, thickness: 3 },
  { x0: 70, y0: 108, x1: 82, y1: 108, thickness: 3 },
  // Minor residential side streets (east side)
  { x0: 90, y0: 40, x1: 90, y1: 78, thickness: 3 },
  { x0: 100, y0: 40, x1: 100, y1: 78, thickness: 3 },
  // Minor residential side streets (south)
  { x0: 40, y0: 78, x1: 40, y1: 108, thickness: 3 },
  { x0: 55, y0: 78, x1: 55, y1: 108, thickness: 3 },
];

// Railway spur near the station, purely decorative/visual context.
export const railway: RoadSegment[] = [
  { x0: 126, y0: 90, x1: 126, y1: 112, thickness: 3, type: TileType.RAIL },
  { x0: 108, y0: 100, x1: 126, y1: 100, thickness: 3, type: TileType.RAIL },
];

// --- Plazas / parks -----------------------------------------------------
export const plazas: RectArea[] = [
  { x0: 60, y0: 54, x1: 80, y1: 66, type: TileType.PLAZA },
];

export const parks: RectArea[] = [
  // Kaštieľsky park (Andrássy manor English park) — the big green anchor west of centre
  { x0: 22, y0: 28, x1: 58, y1: 76, type: TileType.PARK },
  // small green pocket around the Kalvária hill
  { x0: 62, y0: 96, x1: 80, y1: 112, type: TileType.PARK },
];

export const parkPaths: RoadSegment[] = [
  { x0: 40, y0: 28, x1: 40, y1: 76, thickness: 2, type: TileType.PATH },
  { x0: 22, y0: 50, x1: 58, y1: 50, thickness: 2, type: TileType.PATH },
];

// --- Buildings -----------------------------------------------------------
export const buildings: BuildingFootprint[] = [
  // The Andrássy manor, deep inside its park — the town's signature landmark
  { id: 'manor', x: 32, y: 44, w: 12, h: 8, kind: 'manor' },
  // Roman Catholic parish church (Visitation of the Virgin Mary), on the square
  { id: 'parish_church', x: 82, y: 52, w: 8, h: 10, kind: 'church' },
  // Reformed (Calvinist) church, north of the square
  { id: 'reformed_church', x: 60, y: 44, w: 7, h: 9, kind: 'church', roofHorizontal: true },
  // Town hall, facing the square
  { id: 'town_hall', x: 58, y: 56, w: 8, h: 6, kind: 'townhall', roofHorizontal: true },
  // Synagogue, just south of the square
  { id: 'synagogue', x: 76, y: 70, w: 7, h: 7, kind: 'synagogue' },
  // House of culture, east of the square
  { id: 'culture_house', x: 88, y: 56, w: 9, h: 6, kind: 'culturehouse', roofHorizontal: true },
  // Railway station, south-east
  { id: 'train_station', x: 112, y: 88, w: 12, h: 6, kind: 'station', roofHorizontal: true },
  // Calvary hilltop chapel
  { id: 'kalvaria_chapel', x: 68, y: 98, w: 5, h: 5, kind: 'chapel' },

  // --- filler residential / commercial buildings for atmosphere ---
  { id: 'house_1', x: 26, y: 82, w: 5, h: 5, kind: 'house' },
  { id: 'house_2', x: 34, y: 82, w: 5, h: 5, kind: 'house' },
  { id: 'house_3', x: 44, y: 84, w: 5, h: 5, kind: 'house' },
  { id: 'house_4', x: 26, y: 92, w: 5, h: 5, kind: 'house' },
  { id: 'house_5', x: 46, y: 94, w: 5, h: 5, kind: 'house' },
  { id: 'shop_1', x: 64, y: 68, w: 6, h: 5, kind: 'shop' },
  { id: 'shop_2', x: 92, y: 66, w: 6, h: 5, kind: 'shop' },
  { id: 'house_6', x: 92, y: 44, w: 5, h: 5, kind: 'house' },
  { id: 'house_7', x: 92, y: 84, w: 5, h: 5, kind: 'house' },
  { id: 'house_8', x: 102, y: 44, w: 5, h: 5, kind: 'house' },
  { id: 'house_9', x: 102, y: 84, w: 5, h: 5, kind: 'house' },
  { id: 'house_10', x: 112, y: 44, w: 5, h: 5, kind: 'house' },
  { id: 'house_11', x: 76, y: 22, w: 5, h: 5, kind: 'house' },
  { id: 'house_12', x: 86, y: 22, w: 5, h: 5, kind: 'house' },
  { id: 'house_13', x: 60, y: 22, w: 5, h: 5, kind: 'house' },
];

// --- Ambient props (decoration, some walkable-around, non-colliding) ----
export const props: PropSpawn[] = [
  // Park benches & lamps along the manor park paths
  { type: 'bench', x: 40, y: 34 },
  { type: 'bench', x: 40, y: 60 },
  { type: 'lamp', x: 40, y: 30 },
  { type: 'lamp', x: 40, y: 70 },
  { type: 'fountain', x: 48, y: 50 },
  { type: 'tree', x: 26, y: 32 }, { type: 'tree', x: 30, y: 60 },
  { type: 'tree', x: 50, y: 34 }, { type: 'tree', x: 54, y: 66 },
  { type: 'tree', x: 24, y: 70 }, { type: 'tree', x: 56, y: 40 },
  { type: 'tree', x: 34, y: 70 }, { type: 'tree', x: 48, y: 30 },
  { type: 'flowerbed', x: 44, y: 50 },

  // Square dressing
  { type: 'lamp', x: 62, y: 56 }, { type: 'lamp', x: 78, y: 56 },
  { type: 'lamp', x: 62, y: 64 }, { type: 'lamp', x: 78, y: 64 },
  { type: 'bench', x: 66, y: 60 }, { type: 'bench', x: 74, y: 60 },
  { type: 'noticeboard', x: 70, y: 68 },
  { type: 'bike', x: 65, y: 67 },

  // Streets: lamps, bus stop, parked cars, signs
  { type: 'busstop', x: 70, y: 20 },
  { type: 'lamp', x: 70, y: 26 }, { type: 'lamp', x: 70, y: 46 }, { type: 'lamp', x: 70, y: 82 },
  { type: 'car', x: 72, y: 24 }, { type: 'car', x: 68, y: 44 },
  { type: 'sign', x: 71, y: 8 },
  { type: 'tree', x: 84, y: 42 }, { type: 'tree', x: 96, y: 42 },
  { type: 'tree', x: 84, y: 80 }, { type: 'tree', x: 96, y: 80 },
  { type: 'tree', x: 30, y: 80 }, { type: 'tree', x: 50, y: 80 },

  // Kalvária pocket park
  { type: 'tree', x: 64, y: 100 }, { type: 'tree', x: 78, y: 104 },
  { type: 'bench', x: 70, y: 104 },

  // Station forecourt
  { type: 'lamp', x: 114, y: 94 }, { type: 'lamp', x: 122, y: 94 },
  { type: 'sign', x: 112, y: 96 },
];
