/**
 * Transformation layer between real-world geographic coordinates and the
 * game's tile-space coordinates.
 *
 * WHY THIS EXISTS: the task requires that landmark/street positions be
 * derived from real geography rather than hard-coded arbitrarily around the
 * codebase. All lat/lon numbers live in src/data (landmarks.ts) and are
 * converted through this single module. Nothing else should do its own
 * lat/lon math.
 *
 * DATA SOURCE NOTE: this prototype's environment has no outbound network
 * access to OpenStreetMap/Overpass/Nominatim, so the street grid and
 * building footprints in src/world/cityLayout.ts are a small,
 * hand-authored "vertical slice" of central Trebišov, laid out to match
 * the town's real relative geography from public knowledge (the
 * Štefánikova main street / square, the Andrássy manor & English park to
 * the west of the centre, the parish and reformed churches near the
 * square, the synagogue, the town hall, and the railway station to the
 * south-east). Landmark lat/lon values below are best-effort
 * approximations of real locations, not surveyed data.
 *
 * PLUGGING IN REAL OSM DATA LATER:
 *   1. Fetch an Overpass QL export for the Trebišov bounding box (roads,
 *      buildings, landuse=grass/forest, natural=water, railway) as GeoJSON.
 *   2. Write an importer in this folder (e.g. osmImport.ts) that walks the
 *      GeoJSON features and calls `project()` below on every coordinate to
 *      get tile-space points.
 *   3. Feed the resulting polygons into a new world/cityLayout generator
 *      that rasterizes them onto the TileGrid instead of (or blended with)
 *      the hand-authored grid in cityLayout.ts.
 * The rest of the game (rendering, collision, landmarks, journal) only
 * ever consumes tile-space coordinates, so this swap does not touch
 * gameplay code.
 */
import { TILE_SIZE } from '@/config/GameConfig';

export interface LatLon {
  lat: number;
  lon: number;
}

/** Approximate centre of Trebišov, Slovakia — used as the projection origin. */
export const TREBISOV_ORIGIN: LatLon = { lat: 48.6334, lon: 21.7172 };

/** How many real-world meters one tile represents. Keeps the map walkable
 * in a reasonable number of tiles while preserving relative distances. */
const METERS_PER_TILE = 4;

const METERS_PER_DEGREE_LAT = 110_574;
function metersPerDegreeLon(latDeg: number): number {
  return 111_320 * Math.cos((latDeg * Math.PI) / 180);
}

/** World-space tile offset so the projected origin lands roughly in the
 * middle of the hand-authored grid (see cityLayout.ts GRID_WIDTH/HEIGHT). */
export const WORLD_ORIGIN_TILE = { x: 70, y: 62 };

/** Projects a lat/lon into fractional tile coordinates. */
export function project(point: LatLon): { tileX: number; tileY: number } {
  const dLat = point.lat - TREBISOV_ORIGIN.lat;
  const dLon = point.lon - TREBISOV_ORIGIN.lon;
  const metersX = dLon * metersPerDegreeLon(TREBISOV_ORIGIN.lat);
  const metersY = -dLat * METERS_PER_DEGREE_LAT; // north = -Y in screen/tile space
  return {
    tileX: WORLD_ORIGIN_TILE.x + metersX / METERS_PER_TILE,
    tileY: WORLD_ORIGIN_TILE.y + metersY / METERS_PER_TILE,
  };
}

/** Projects a lat/lon straight to pixel world coordinates. */
export function projectToPixels(point: LatLon): { x: number; y: number } {
  const { tileX, tileY } = project(point);
  return { x: tileX * TILE_SIZE, y: tileY * TILE_SIZE };
}

export function tileToPixels(tileX: number, tileY: number): { x: number; y: number } {
  return { x: tileX * TILE_SIZE, y: tileY * TILE_SIZE };
}
