import Phaser from 'phaser';
import { DEPTH, GAME_WIDTH, TILE_SIZE } from '@/config/GameConfig';
import { GRID_WIDTH, GRID_HEIGHT, roads, areaPolygons, plazas } from '@/world/cityLayout';
import { TileType } from '@/world/TileGrid';
import { landmarks } from '@/data/landmarks';
import { landmarkManager } from '@/systems/LandmarkManager';
import { EventBus, GameEvents } from '@/systems/EventBus';

const MAP_W = 210;
const MAP_H = 190;
const MARGIN = 18;

const CATEGORY_COLOR: Record<string, number> = {
  heritage: 0xc9a34a,
  religious: 0x8aa0c9,
  civic: 0xb08a5a,
  nature: 0x6fae5a,
  transport: 0xaa6f6f,
};

/** Small stylized minimap in the top-right corner. Redraws the static
 * city geometry once, then only updates the player marker + landmark
 * discovery dots each frame/event — cheap enough to run continuously. */
export class MiniMap {
  private scene: Phaser.Scene;
  private root: Phaser.GameObjects.Container;
  private staticGfx: Phaser.GameObjects.Graphics;
  private playerDot: Phaser.GameObjects.Arc;
  private landmarkDots: Map<string, Phaser.GameObjects.Arc> = new Map();
  private scaleX: number;
  private scaleY: number;
  private originX: number;
  private originY: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scaleX = MAP_W / (GRID_WIDTH * TILE_SIZE);
    this.scaleY = MAP_H / (GRID_HEIGHT * TILE_SIZE);

    this.originX = GAME_WIDTH - MAP_W - MARGIN;
    this.originY = MARGIN;

    const frame = scene.add.graphics();
    frame.fillStyle(0x0c0d11, 0.85);
    frame.fillRoundedRect(-6, -6, MAP_W + 12, MAP_H + 12, 8);
    frame.lineStyle(2, 0xf0e6c8, 0.6);
    frame.strokeRoundedRect(-5, -5, MAP_W + 10, MAP_H + 10, 8);

    const label = scene.add.text(MAP_W / 2, -20, 'TREBIŠOV', {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#c9bfa0', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.staticGfx = scene.add.graphics();
    this.drawStatic();

    this.playerDot = scene.add.circle(0, 0, 4, 0xffffff).setStrokeStyle(1, 0x14161c);

    this.root = scene.add.container(this.originX, this.originY, [frame, this.staticGfx, label]);
    this.root.setDepth(DEPTH.UI);
    this.root.setScrollFactor(0);

    for (const lm of landmarks) {
      const [x, y] = this.worldToMap(lm.tileX * TILE_SIZE, lm.tileY * TILE_SIZE);
      const dot = scene.add.circle(x, y, 3, CATEGORY_COLOR[lm.category] ?? 0xffffff);
      dot.setStrokeStyle(1, 0x14161c, 0.8);
      this.root.add(dot);
      this.landmarkDots.set(lm.id, dot);
    }
    this.root.add(this.playerDot);
    this.refreshDiscovered();

    EventBus.on(GameEvents.LANDMARK_DISCOVERED, () => this.refreshDiscovered());
    EventBus.on(GameEvents.PLAYER_TILE_MOVED, (tile: { x: number; y: number }) => {
      const [x, y] = this.worldToMap(tile.x * TILE_SIZE, tile.y * TILE_SIZE);
      this.playerDot.setPosition(x, y);
    });
  }

  private worldToMap(wx: number, wy: number): [number, number] {
    return [wx * this.scaleX, wy * this.scaleY];
  }

  private drawStatic(): void {
    const g = this.staticGfx;
    g.fillStyle(0x1c2317, 1);
    g.fillRect(0, 0, MAP_W, MAP_H);

    for (const area of areaPolygons) {
      g.fillStyle(area.type === TileType.WATER ? 0x274a5c : 0x2d4425, 1);
      g.beginPath();
      area.points.forEach(([x, y], i) => {
        const px = x * TILE_SIZE * this.scaleX;
        const py = y * TILE_SIZE * this.scaleY;
        if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
      });
      g.closePath();
      g.fillPath();
    }
    for (const area of plazas) {
      g.fillStyle(0x4a4433, 1);
      g.fillRect(area.x0 * TILE_SIZE * this.scaleX, area.y0 * TILE_SIZE * this.scaleY,
        (area.x1 - area.x0) * TILE_SIZE * this.scaleX, (area.y1 - area.y0) * TILE_SIZE * this.scaleY);
    }
    g.lineStyle(1.4, 0x8a8570, 0.9);
    for (const seg of roads) {
      g.beginPath();
      g.moveTo(seg.x0 * TILE_SIZE * this.scaleX, seg.y0 * TILE_SIZE * this.scaleY);
      g.lineTo(seg.x1 * TILE_SIZE * this.scaleX, seg.y1 * TILE_SIZE * this.scaleY);
      g.strokePath();
    }
  }

  private refreshDiscovered(): void {
    for (const lm of landmarks) {
      const dot = this.landmarkDots.get(lm.id);
      if (!dot) continue;
      const discovered = landmarkManager.isDiscovered(lm.id);
      dot.setAlpha(discovered ? 1 : 0.35);
      dot.setScale(discovered ? 1.15 : 0.8);
    }
  }
}
