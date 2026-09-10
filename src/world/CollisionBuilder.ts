import Phaser from 'phaser';
import { TILE_SIZE } from '@/config/GameConfig';
import { buildings } from './cityLayout';
import { getFootprintRect } from '@/assets/buildingTexture';

/** 1x1 transparent texture key used for invisible static collision bodies.
 * Generated once by PixelArtFactory-adjacent boot code (see WorldScene). */
export const COLLIDER_TEXTURE_KEY = 'collider_px';

/** Builds an invisible static physics group with one rectangle body per
 * building footprint, matching the same rect renderBuildings() draws the
 * sprite at (see getFootprintRect — real size for curated landmarks,
 * bucket-rounded size for everything else) so visuals and collision never
 * disagree, and never the roof overhang, which is purely visual. */
export function buildCollisionGroup(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  const group = scene.physics.add.staticGroup();

  for (const b of buildings) {
    const rect = getFootprintRect(b);
    const width = rect.w * TILE_SIZE;
    const height = rect.h * TILE_SIZE;
    const cx = (rect.x0 + rect.w / 2) * TILE_SIZE;
    const cy = (rect.y0 + rect.h / 2) * TILE_SIZE;
    const body = scene.add.image(cx, cy, COLLIDER_TEXTURE_KEY) as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.StaticBody };
    body.setVisible(false);
    group.add(body);
    body.setDisplaySize(width, height);
    (body.body as Phaser.Physics.Arcade.StaticBody).setSize(width, height);
    (body.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
  }

  return group;
}
