/**
 * Transformation layer between real-world geographic coordinates and the
 * game's tile-space coordinates.
 *
 * WHY THIS EXISTS: the task requires that landmark/street positions be
 * derived from real geography rather than hard-coded arbitrarily around the
 * codebase. All lat/lon numbers live in src/data and src/world/generated
 * and are converted through this single module (and its build-time twin,
 * scripts/generate-city-data.mjs, which shares geoConstants.json so the two
 * projections never drift apart).
 *
 * DATA SOURCE: `src/world/cityLayout.ts` (roads + building footprints) and
 * `src/data/landmarkAnchors.generated.ts` (landmark tile positions) are
 * generated from real OpenStreetMap data — an Overpass API export covering
 * central Trebišov (roads/rail, building footprints, and named
 * points-of-interest / land use). See `scripts/generate-city-data.mjs` for
 * the full pipeline and the Overpass QL queries used to fetch it, and
 * `data/osm/README.md` for provenance/licensing (© OpenStreetMap
 * contributors, ODbL). The playable area is a bounding box around
 * Trebišov's historic civic core (the Andrássy manor & park, Mariánske
 * námestie with its two churches, the town hall, the cultural centre, the
 * Andrássy mausoleum and Parič castle ruins) extended north along
 * M. R. Štefánika street to the railway/bus terminal — not the whole town,
 * per the brief's own "polished vertical slice first" guidance.
 *
 * RE-RUNNING / EXTENDING WITH MORE REAL DATA LATER:
 *   1. Fetch a fresh Overpass QL export for a bounding box (roads,
 *      buildings, landuse=grass/forest/cemetery, natural=water, railway,
 *      named POIs) as JSON (`out geom;` for ways so each carries a
 *      lat/lon-per-node geometry array).
 *   2. Update `bboxLatMin/Max`/`bboxLonMin/Max` in geoConstants.json and the
 *      RAW_DIR / bbox constants at the top of
 *      scripts/generate-city-data.mjs, then re-run it — it rewrites
 *      src/world/cityLayout.ts and src/data/landmarkAnchors.generated.ts.
 * The rest of the game (rendering, collision, landmarks, journal, minimap)
 * only ever consumes tile-space coordinates, so this never touches
 * gameplay code.
 */
import { TILE_SIZE } from '@/config/GameConfig';
import geoConstants from './geoConstants.json';

export interface LatLon {
  lat: number;
  lon: number;
}

/** Real reference point — the north-west corner of the playable bounding
 * box — so every projected tile coordinate inside it comes out positive. */
export const TREBISOV_ORIGIN: LatLon = { lat: geoConstants.originLat, lon: geoConstants.originLon };

/** How many real-world meters one tile represents. Keeps the map walkable
 * in a reasonable number of tiles while preserving relative distances. */
const METERS_PER_TILE = geoConstants.metersPerTile;

const METERS_PER_DEGREE_LAT = 110_574;
function metersPerDegreeLon(latDeg: number): number {
  return 111_320 * Math.cos((latDeg * Math.PI) / 180);
}

export const WORLD_ORIGIN_TILE = { x: geoConstants.worldOriginTileX, y: geoConstants.worldOriginTileY };

export const PLAYABLE_BBOX = {
  latMin: geoConstants.bboxLatMin,
  latMax: geoConstants.bboxLatMax,
  lonMin: geoConstants.bboxLonMin,
  lonMax: geoConstants.bboxLonMax,
};

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
