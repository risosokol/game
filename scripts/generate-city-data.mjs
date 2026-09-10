#!/usr/bin/env node
/**
 * Generates src/world/cityLayout.ts and src/data/landmarkAnchors.generated.ts
 * from real OpenStreetMap Overpass API exports.
 *
 * WHY THIS SCRIPT EXISTS: the game's map must be a recognizable recreation
 * of real Trebišov, not an invented town. This is a one-time / occasional
 * offline build step (not run as part of `npm run dev`/`build`, since it
 * needs the raw Overpass exports which are not shipped with the repo) that
 * turns raw OSM geometry into the tile-space data the game actually
 * consumes. Run it again whenever the bounding box changes or the raw
 * exports are refreshed:
 *
 *   node scripts/generate-city-data.mjs <roads.json> <buildings.json> <poi.json>
 *
 * INPUT FORMAT: each argument is the JSON response of an Overpass API
 * `[out:json]` query using `out geom;` (so every way carries a
 * `geometry: [{lat,lon}, ...]` array, not just node ids). The three
 * queries used to build this game's data were (bbox = south,west,north,east):
 *
 *   roads.json:
 *     [out:json][timeout:60];
 *     ( way["highway"](bbox); way["railway"](bbox); );
 *     out geom;
 *
 *   buildings.json:
 *     [out:json][timeout:120];
 *     ( way["building"](bbox); relation["building"](bbox); );
 *     out geom;
 *
 *   poi.json (named points of interest + land use):
 *     [out:json][timeout:60];
 *     ( node["name"](bbox); way["landuse"](bbox); way["leisure"](bbox);
 *       way["natural"="water"](bbox); way["waterway"](bbox);
 *       relation["landuse"](bbox); );
 *     out geom;
 *
 * OUTPUT: overwrites src/world/cityLayout.ts (roads, rail, area polygons,
 * a small plaza rect around the church square, and every building
 * footprint in the bounding box) and src/data/landmarkAnchors.generated.ts
 * (tile-space anchor points for the curated real landmarks in
 * src/data/landmarks.ts). See src/geo/GeoTransform.ts for the projection
 * this mirrors and geoConstants.json for the shared origin/bbox.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const geoConstants = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/geo/geoConstants.json'), 'utf8'));
const { originLat, originLon, metersPerTile, worldOriginTileX, worldOriginTileY, bboxLatMin, bboxLatMax, bboxLonMin, bboxLonMax } = geoConstants;

const METERS_PER_DEGREE_LAT = 110_574;
function metersPerDegreeLon(latDeg) {
  return 111_320 * Math.cos((latDeg * Math.PI) / 180);
}
/** Mirrors src/geo/GeoTransform.ts#project exactly. */
function project(lat, lon) {
  const dLat = lat - originLat;
  const dLon = lon - originLon;
  const metersX = dLon * metersPerDegreeLon(originLat);
  const metersY = -dLat * METERS_PER_DEGREE_LAT;
  return {
    x: worldOriginTileX + metersX / metersPerTile,
    y: worldOriginTileY + metersY / metersPerTile,
  };
}

const [, , roadsPath, buildingsPath, poiPath] = process.argv;
if (!roadsPath || !buildingsPath || !poiPath) {
  console.error('Usage: node generate-city-data.mjs <roads.json> <buildings.json> <poi.json>');
  process.exit(1);
}

function loadElements(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8')).elements;
}

const roadsRaw = loadElements(roadsPath);
const buildingsRaw = loadElements(buildingsPath);
const poiRaw = loadElements(poiPath);

const topLeft = project(bboxLatMax, bboxLonMin);
const bottomRight = project(bboxLatMin, bboxLonMax);
const GRID_WIDTH = Math.ceil(bottomRight.x - topLeft.x);
const GRID_HEIGHT = Math.ceil(bottomRight.y - topLeft.y);

function inGrid(pt, margin = 40) {
  return pt.x >= -margin && pt.x <= GRID_WIDTH + margin && pt.y >= -margin && pt.y <= GRID_HEIGHT + margin;
}

// --------------------------------------------------------------- roads ---
const HIGHWAY_WIDTH = {
  primary: 7, secondary: 6, tertiary: 5, residential: 4,
  living_street: 3, pedestrian: 4, unclassified: 4, cycleway: 2,
};
const roadSegments = [];
const railSegments = [];

for (const e of roadsRaw) {
  if (e.type !== 'way' || !e.geometry) continue;
  const t = e.tags || {};
  let thickness = null;
  let isRail = false;
  if (t.railway === 'rail') { thickness = 3; isRail = true; }
  else if (t.highway && HIGHWAY_WIDTH[t.highway]) thickness = HIGHWAY_WIDTH[t.highway];
  if (!thickness) continue;

  const pts = e.geometry.map((g) => project(g.lat, g.lon));
  if (!pts.some((p) => inGrid(p, 15))) continue;

  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1];
    if (!inGrid(a, 15) && !inGrid(b, 15)) continue;
    const seg = { x0: round2(a.x), y0: round2(a.y), x1: round2(b.x), y1: round2(b.y), thickness };
    (isRail ? railSegments : roadSegments).push(seg);
  }
}

function round2(n) { return Math.round(n * 100) / 100; }

// -------------------------------------------------------------- areas ----
const areaPolygons = [];
let cemeteryFound = false;

for (const e of poiRaw) {
  if (!e.geometry || e.geometry.length < 3) continue;
  const t = e.tags || {};
  let kind = null;
  if (t.leisure === 'park') kind = 'park';
  else if (t.landuse === 'cemetery') kind = 'park'; // reuse park tile visually (quiet green area)
  else if (t.natural === 'water') kind = 'water';
  if (!kind) continue;

  const pts = e.geometry.map((g) => project(g.lat, g.lon));
  if (!pts.some((p) => inGrid(p, 5))) continue;
  areaPolygons.push({ type: kind === 'water' ? 'WATER' : 'PARK', points: pts.map((p) => [round2(p.x), round2(p.y)]) });
  if (t.landuse === 'cemetery') cemeteryFound = true;
}
void cemeteryFound;

// ---------------------------------------------------------- buildings ----
const KIND_RULES = [
  [(t) => t.historic === 'manor', 'manor'],
  [(t) => t.historic === 'tomb', 'mausoleum'],
  [(t) => t.amenity === 'place_of_worship' || t.building === 'church', 'church'],
  [(t) => t.amenity === 'townhall', 'townhall'],
  [(t) => t.tourism === 'gallery' || t.tourism === 'museum' || t.amenity === 'community_centre' || t.amenity === 'library', 'culturehouse'],
  [(t) => t.amenity === 'school', 'culturehouse'],
  [(t) => t.railway === 'station' || /terminál/i.test(t.name || ''), 'station'],
  [(t) => !!t.shop || t.amenity === 'bank' || t.amenity === 'pharmacy' || ['retail', 'commercial', 'supermarket'].includes(t.building), 'shop'],
];
function inferKind(t) {
  for (const [test, kind] of KIND_RULES) if (test(t)) return kind;
  return 'house';
}

// Curated real landmarks: OSM way id -> friendly building id used by
// src/data/landmarks.ts. Everything else gets a generic `b<osmid>` id.
const CURATED_BUILDING_IDS = {
  69131735: 'andrassy_manor',
  69129520: 'koniaren_gallery',
  69124900: 'parish_church',
  69125155: 'greekcatholic_church',
  69126093: 'town_hall',
  69126673: 'culture_centre',
  69123653: 'andrassy_mausoleum',
  1170394635: 'train_station',
};

const buildings = [];
const buildingById = new Map();

for (const e of buildingsRaw) {
  if (e.type !== 'way' || !e.tags || !e.tags.building) continue;
  const bb = e.bounds;
  if (!bb) continue;
  const p1 = project(bb.maxlat, bb.minlon); // north-west -> smallest x, smallest y
  const p2 = project(bb.minlat, bb.maxlon); // south-east -> largest x, largest y
  const x0 = Math.min(p1.x, p2.x), y0 = Math.min(p1.y, p2.y);
  const x1 = Math.max(p1.x, p2.x), y1 = Math.max(p1.y, p2.y);
  if (!inGrid({ x: x0, y: y0 }, 5) && !inGrid({ x: x1, y: y1 }, 5)) continue;

  let w = Math.round(x1 - x0);
  let h = Math.round(y1 - y0);
  if (!Number.isFinite(w) || !Number.isFinite(h)) continue;
  w = Math.min(60, Math.max(2, w));
  h = Math.min(60, Math.max(2, h));

  const id = CURATED_BUILDING_IDS[e.id] || `b${e.id}`;
  const kind = CURATED_BUILDING_IDS[e.id]
    ? inferKind(e.tags) // still tag-driven even for curated ones (keeps rules single-sourced)
    : inferKind(e.tags);

  const building = {
    id,
    x: round2(x0),
    y: round2(y0),
    w,
    h,
    kind,
    roofHorizontal: w >= h,
  };
  buildings.push(building);
  buildingById.set(id, building);
}

// Parič castle ruins has no mapped building polygon — synthesize a small
// footprint at its real point location so it can be discovered/rendered.
const paricNode = poiRaw.find((e) => e.type === 'node' && (e.tags || {}).name === 'Hrad Parič')
  || poiRaw.find((e) => e.type === 'node' && (e.tags || {}).historic === 'castle');
let paricAnchor = null;
if (paricNode) {
  const p = project(paricNode.lat, paricNode.lon);
  const w = 7, h = 5;
  const ruins = { id: 'paric_castle', x: round2(p.x - w / 2), y: round2(p.y - h / 2), w, h, kind: 'ruins', roofHorizontal: true };
  buildings.push(ruins);
  buildingById.set('paric_castle', ruins);
  paricAnchor = { tileX: round2(p.x), tileY: round2(p.y + h / 2 + 2), lat: paricNode.lat, lon: paricNode.lon, buildingId: 'paric_castle' };
}

// -------------------------------------------------------------- plaza ----
// Mariánske námestie: the small square between the two churches. Derived
// from real church + monument coordinates rather than eyeballed.
const parishChurch = buildingById.get('parish_church');
const gcChurch = buildingById.get('greekcatholic_church');
const marianColumn = poiRaw.find((e) => e.type === 'node' && (e.tags || {}).name === 'Mariánsky stĺp');
let plazaRect = null;
if (parishChurch && gcChurch) {
  const pts = [
    { x: parishChurch.x, y: parishChurch.y }, { x: parishChurch.x + parishChurch.w, y: parishChurch.y + parishChurch.h },
    { x: gcChurch.x, y: gcChurch.y }, { x: gcChurch.x + gcChurch.w, y: gcChurch.y + gcChurch.h },
  ];
  if (marianColumn) pts.push(project(marianColumn.lat, marianColumn.lon));
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const margin = 5;
  plazaRect = {
    x0: round2(Math.min(...xs) - margin), y0: round2(Math.min(...ys) - margin),
    x1: round2(Math.max(...xs) + margin), y1: round2(Math.max(...ys) + margin),
  };
}

// ---------------------------------------------------------- landmarks ----
function findNode(name) {
  const n = poiRaw.find((e) => e.type === 'node' && (e.tags || {}).name === name);
  return n ? project(n.lat, n.lon) : null;
}
function buildingAnchor(id, southOffset = 2) {
  const b = buildingById.get(id);
  if (!b) return null;
  return { tileX: round2(b.x + b.w / 2), tileY: round2(b.y + b.h + southOffset) };
}

const parkAnchorPt = findNode('Andrássyovský park');

const landmarkAnchors = {
  andrassy_manor: { ...buildingAnchor('andrassy_manor'), buildingId: 'andrassy_manor' },
  mestsky_park: parkAnchorPt ? { tileX: round2(parkAnchorPt.x), tileY: round2(parkAnchorPt.y) } : null,
  koniaren_gallery: { ...buildingAnchor('koniaren_gallery'), buildingId: 'koniaren_gallery' },
  parish_church: { ...buildingAnchor('parish_church'), buildingId: 'parish_church' },
  greekcatholic_church: { ...buildingAnchor('greekcatholic_church'), buildingId: 'greekcatholic_church' },
  town_hall: { ...buildingAnchor('town_hall'), buildingId: 'town_hall' },
  culture_centre: { ...buildingAnchor('culture_centre'), buildingId: 'culture_centre' },
  andrassy_mausoleum: { ...buildingAnchor('andrassy_mausoleum'), buildingId: 'andrassy_mausoleum' },
  paric_castle: paricAnchor,
  train_station: { ...buildingAnchor('train_station'), buildingId: 'train_station' },
};

for (const [k, v] of Object.entries(landmarkAnchors)) {
  if (!v || v.tileX == null) console.warn(`[generate-city-data] WARNING: no anchor resolved for landmark "${k}"`);
}

// ------------------------------------------------------------- write -----
function fmtNum(n) { return Number.isInteger(n) ? String(n) : n.toFixed(2); }

const roadsTs = roadSegments.map((s) => `  { x0: ${fmtNum(s.x0)}, y0: ${fmtNum(s.y0)}, x1: ${fmtNum(s.x1)}, y1: ${fmtNum(s.y1)}, thickness: ${s.thickness} },`).join('\n');
const railTs = railSegments.map((s) => `  { x0: ${fmtNum(s.x0)}, y0: ${fmtNum(s.y0)}, x1: ${fmtNum(s.x1)}, y1: ${fmtNum(s.y1)}, thickness: ${s.thickness}, type: TileType.RAIL },`).join('\n');
const areasTs = areaPolygons.map((a) => `  { type: TileType.${a.type}, points: [${a.points.map(([x, y]) => `[${fmtNum(x)},${fmtNum(y)}]`).join(',')}] },`).join('\n');
const buildingsTs = buildings.map((b) => `  { id: ${JSON.stringify(b.id)}, x: ${fmtNum(b.x)}, y: ${fmtNum(b.y)}, w: ${b.w}, h: ${b.h}, kind: ${JSON.stringify(b.kind)}, roofHorizontal: ${b.roofHorizontal} },`).join('\n');

const cityLayoutTs = `/**
 * AUTO-GENERATED by scripts/generate-city-data.mjs from real OpenStreetMap
 * data (© OpenStreetMap contributors, ODbL) — see data/osm/README.md for
 * provenance and the Overpass queries used, and src/geo/GeoTransform.ts for
 * the lat/lon -> tile-space projection this mirrors.
 *
 * DO NOT hand-edit the roads/railway/areaPolygons/buildings arrays below —
 * re-run the generator instead so the geometry stays traceable to real
 * data. Hand-placed decoration (benches, lamps, trees) lives separately in
 * src/world/cityProps.ts, which is NOT regenerated.
 *
 * Bounding box: lat [${bboxLatMin}, ${bboxLatMax}], lon [${bboxLonMin}, ${bboxLonMax}]
 * covering Trebišov's historic civic core (Andrássy manor & park,
 * Mariánske námestie with its Roman Catholic and Greek Catholic churches,
 * the town hall, the cultural centre, the Andrássy mausoleum, Parič castle
 * ruins) extended north along M. R. Štefánika street to the railway/bus
 * terminal.
 */
import { TileType } from './TileGrid';

export const GRID_WIDTH = ${GRID_WIDTH};
export const GRID_HEIGHT = ${GRID_HEIGHT};

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

export interface AreaPolygon {
  type: TileType;
  points: [number, number][];
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
  | 'chapel'
  | 'mausoleum'
  | 'ruins';

export interface BuildingFootprint {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: BuildingKind;
  roofHorizontal?: boolean;
}

// --- Real street/rail network (OSM highway=* / railway=rail) -----------
export const roads: RoadSegment[] = [
${roadsTs}
];

export const railway: RoadSegment[] = [
${railTs}
];

// --- Real land-use areas (OSM leisure=park / natural=water) ------------
export const areaPolygons: AreaPolygon[] = [
${areasTs}
];

// --- Mariánske námestie — the square between the two churches ----------
export const plazas: RectArea[] = [
${plazaRect ? `  { x0: ${fmtNum(plazaRect.x0)}, y0: ${fmtNum(plazaRect.y0)}, x1: ${fmtNum(plazaRect.x1)}, y1: ${fmtNum(plazaRect.y1)}, type: TileType.PLAZA },` : ''}
];

// --- Real building footprints (OSM building=*) --------------------------
export const buildings: BuildingFootprint[] = [
${buildingsTs}
];
`;

fs.writeFileSync(path.join(ROOT, 'src/world/cityLayout.ts'), cityLayoutTs);

function anchorTs(a) {
  if (!a) return 'null';
  const parts = [`tileX: ${fmtNum(a.tileX)}`, `tileY: ${fmtNum(a.tileY)}`];
  if (a.buildingId) parts.push(`buildingId: ${JSON.stringify(a.buildingId)}`);
  return `{ ${parts.join(', ')} }`;
}

const anchorsTs = `/**
 * AUTO-GENERATED by scripts/generate-city-data.mjs — tile-space anchor
 * points for the curated real landmarks referenced from src/data/landmarks.ts.
 * Re-run the generator to refresh; do not hand-edit.
 */
export interface LandmarkAnchor {
  tileX: number;
  tileY: number;
  buildingId?: string;
}

export const landmarkAnchors: Record<string, LandmarkAnchor> = {
${Object.entries(landmarkAnchors).map(([k, v]) => `  ${k}: ${anchorTs(v)},`).join('\n')}
};
`;

fs.writeFileSync(path.join(ROOT, 'src/data/landmarkAnchors.generated.ts'), anchorsTs);

console.log(`Generated cityLayout.ts: grid ${GRID_WIDTH}x${GRID_HEIGHT}, ${roadSegments.length} road segments, ${railSegments.length} rail segments, ${areaPolygons.length} area polygons, ${buildings.length} buildings.`);
console.log('Landmark anchors:', JSON.stringify(landmarkAnchors, null, 2));
