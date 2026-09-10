import type { BuildingFootprint } from '@/world/cityLayout';
import { buildingTextureKey } from './TextureKeys';

/**
 * The playable area now includes ~2,400 real OSM building footprints, far
 * too many to give each its own hand-detailed procedural texture. Curated,
 * individually-discoverable landmarks still get a unique texture (worth
 * the detail); every other building reuses one texture per
 * (kind, rounded size) bucket — same generic architecture, correct real
 * footprint size/position/collision. Shared between PixelArtFactory
 * (which generates the textures) and WorldRenderer (which assigns them),
 * so the two can never drift apart on naming.
 */
export const CURATED_BUILDING_IDS = new Set([
  'andrassy_manor',
  'koniaren_gallery',
  'parish_church',
  'greekcatholic_church',
  'town_hall',
  'culture_centre',
  'andrassy_mausoleum',
  'train_station',
  'paric_castle',
]);

const BUCKET_STEP = 2;
const MAX_BUCKET_DIM = 30;

function bucketDim(n: number): number {
  const rounded = Math.round(n / BUCKET_STEP) * BUCKET_STEP;
  return Math.max(BUCKET_STEP, Math.min(MAX_BUCKET_DIM, rounded));
}

export function isCurated(b: BuildingFootprint): boolean {
  return CURATED_BUILDING_IDS.has(b.id);
}

export function bucketKeyFor(kind: string, w: number, h: number): string {
  return `building_bucket_${kind}_${bucketDim(w)}x${bucketDim(h)}`;
}

/**
 * The footprint size actually used for a building's sprite AND its
 * collision box. Curated landmarks keep their exact real footprint
 * (unique texture, no rounding); everything else is rounded to its
 * texture bucket size (±1 tile, ~±4m — imperceptible at this scale) so
 * the rendered sprite and the collider it uses always agree exactly.
 */
export function effectiveFootprint(b: BuildingFootprint): { w: number; h: number } {
  return isCurated(b) ? { w: b.w, h: b.h } : bucketDim2(b.w, b.h);
}

function bucketDim2(w: number, h: number): { w: number; h: number } {
  return { w: bucketDim(w), h: bucketDim(h) };
}

/**
 * The tile-space rectangle actually used for both a building's sprite and
 * its collider, centered on the building's real position so bucket
 * rounding grows/shrinks the footprint symmetrically rather than drifting
 * it off its real location.
 */
export function getFootprintRect(b: BuildingFootprint): { x0: number; y0: number; x1: number; y1: number; w: number; h: number } {
  const { w, h } = effectiveFootprint(b);
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  return { x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2, w, h };
}

export function textureKeyFor(b: BuildingFootprint): string {
  return isCurated(b) ? buildingTextureKey(b.id) : bucketKeyFor(b.kind, b.w, b.h);
}
