import Phaser from 'phaser';
import { TILE_SIZE, DEPTH } from '@/config/GameConfig';
import { TileGrid } from './TileGrid';
import { TILESET_KEY, tileTypeToIndex } from './tileIndex';
import { buildings, BuildingFootprint } from './cityLayout';
import { props } from './cityProps';
import { PropTextureKeys } from '@/assets/TextureKeys';
import { textureKeyFor, getFootprintRect } from '@/assets/buildingTexture';

/** Turns a TileGrid + the hand-authored building/prop lists into actual
 * Phaser display objects. Ground tiles use a real Tilemap layer (so Phaser
 * gets camera culling "for free"); buildings/props are plain image game
 * objects depth-sorted by their world Y for the 2.5D look. */
export function renderTileLayer(scene: Phaser.Scene, grid: TileGrid): { map: Phaser.Tilemaps.Tilemap; groundLayer: Phaser.Tilemaps.TilemapLayer } {
  const data: number[][] = [];
  for (let y = 0; y < grid.height; y++) {
    const row: number[] = [];
    for (let x = 0; x < grid.width; x++) {
      row.push(tileTypeToIndex(grid.get(x, y)));
    }
    data.push(row);
  }

  const map = scene.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
  const tileset = map.addTilesetImage(TILESET_KEY, TILESET_KEY, TILE_SIZE, TILE_SIZE, 0, 0)!;
  const groundLayer = map.createLayer(0, tileset, 0, 0)!;
  groundLayer.setDepth(DEPTH.GROUND);
  return { map, groundLayer };
}

export function renderBuildings(scene: Phaser.Scene): Map<string, Phaser.GameObjects.Image> {
  const sprites = new Map<string, Phaser.GameObjects.Image>();
  for (const b of buildings) {
    const rect = getFootprintRect(b);
    const bottomY = rect.y1 * TILE_SIZE;
    const centerX = (rect.x0 + rect.w / 2) * TILE_SIZE;
    const img = scene.add.image(centerX, bottomY, textureKeyFor(b));
    img.setOrigin(0.5, 1);
    img.setDepth(bottomY);
    sprites.set(b.id, img);
  }
  return sprites;
}

const PROP_SIZE_HINT: Record<string, { originY: number }> = {
  tree: { originY: 0.93 },
  lamp: { originY: 1 },
  bench: { originY: 0.85 },
  busstop: { originY: 0.98 },
  flowerbed: { originY: 1 },
  fountain: { originY: 0.95 },
  sign: { originY: 1 },
  bike: { originY: 0.85 },
  car: { originY: 0.95 },
  noticeboard: { originY: 0.98 },
  monument: { originY: 0.97 },
};

export function renderProps(scene: Phaser.Scene): void {
  for (const p of props) {
    const px = p.x * TILE_SIZE;
    const py = p.y * TILE_SIZE;
    const key = PropTextureKeys[p.type];
    const hint = PROP_SIZE_HINT[p.type] ?? { originY: 0.9 };
    const img = scene.add.image(px, py, key);
    img.setOrigin(0.5, hint.originY);
    img.setDepth(py);
  }
}

export function buildingFootprintById(id: string): BuildingFootprint | undefined {
  return buildings.find((b) => b.id === id);
}
