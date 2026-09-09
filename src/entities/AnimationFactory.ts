import Phaser from 'phaser';
import { PlayerTextureKeys, NpcTextureKeys } from '@/assets/TextureKeys';

const DIRS = ['down', 'up', 'side'];

export function playerAnimKey(action: 'idle' | 'walk', dir: string): string {
  return `player_${action}_${dir}`;
}

export function npcAnimKey(paletteId: number, action: 'idle' | 'walk', dir: string): string {
  return `npc${paletteId}_${action}_${dir}`;
}

/** Builds every walk/idle animation for the player and the small NPC
 * palette set. Must run once, after PixelArtFactory has generated the
 * underlying per-frame textures. */
export function createAllAnimations(scene: Phaser.Scene): void {
  const anims = scene.anims;

  for (const dir of DIRS) {
    if (!anims.exists(playerAnimKey('idle', dir))) {
      anims.create({
        key: playerAnimKey('idle', dir),
        frames: [{ key: PlayerTextureKeys.idle(dir) }],
        frameRate: 1,
        repeat: -1,
      });
    }
    if (!anims.exists(playerAnimKey('walk', dir))) {
      anims.create({
        key: playerAnimKey('walk', dir),
        frames: [
          { key: PlayerTextureKeys.walk(dir, 0) },
          { key: PlayerTextureKeys.idle(dir) },
          { key: PlayerTextureKeys.walk(dir, 1) },
          { key: PlayerTextureKeys.idle(dir) },
        ],
        frameRate: 8,
        repeat: -1,
      });
    }
  }

  for (let p = 0; p < 3; p++) {
    for (const dir of DIRS) {
      if (!anims.exists(npcAnimKey(p, 'idle', dir))) {
        anims.create({
          key: npcAnimKey(p, 'idle', dir),
          frames: [{ key: NpcTextureKeys.idle(p, dir) }],
          frameRate: 1,
          repeat: -1,
        });
      }
      if (!anims.exists(npcAnimKey(p, 'walk', dir))) {
        anims.create({
          key: npcAnimKey(p, 'walk', dir),
          frames: [
            { key: NpcTextureKeys.walk(p, dir, 0) },
            { key: NpcTextureKeys.idle(p, dir) },
            { key: NpcTextureKeys.walk(p, dir, 1) },
            { key: NpcTextureKeys.idle(p, dir) },
          ],
          frameRate: 6,
          repeat: -1,
        });
      }
    }
  }
}
