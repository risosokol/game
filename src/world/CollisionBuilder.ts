import Phaser from 'phaser';
import { TILE_SIZE } from '@/config/GameConfig';
import { buildings } from './cityLayout';

/** 1x1 transparent texture key used for invisible static collision bodies.
 * Generated once by PixelArtFactory-adjacent boot code (see WorldScene). */
export const COLLIDER_TEXTURE_KEY = 'collider_px';

/** Builds an invisible static physics group with one rectangle body per
 * building footprint, matching the ground floor exactly (not the roof
 * overhang, which is purely visual and should not block movement). */
export function buildCollisionGroup(scene: Phaser.Scene): Phaser.Physics.Arcade.StaticGroup {
  const group = scene.physics.add.staticGroup();

  for (const b of buildings) {
    const width = b.w * TILE_SIZE;
    const height = b.h * TILE_SIZE;
    const cx = (b.x + b.w / 2) * TILE_SIZE;
    const cy = (b.y + b.h / 2) * TILE_SIZE;
    const body = scene.add.image(cx, cy, COLLIDER_TEXTURE_KEY) as Phaser.GameObjects.Image & { body: Phaser.Physics.Arcade.StaticBody };
    body.setVisible(false);
    group.add(body);
    body.setDisplaySize(width, height);
    (body.body as Phaser.Physics.Arcade.StaticBody).setSize(width, height);
    (body.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
  }

  return group;
}
