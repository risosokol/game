import Phaser from 'phaser';
import { CharacterSheetKeys, CHARACTER_WALK_FRAME_COUNT, CHARACTER_IDLE_FRAME, SparkleFrameKeys, SPARKLE_FRAME_COUNT } from '@/assets/TextureKeys';

export const SPARKLE_ANIM_KEY = 'discovery_sparkle';

const DIRS: Array<'down' | 'up' | 'left' | 'right'> = ['down', 'up', 'left', 'right'];

export function playerAnimKey(action: 'idle' | 'walk', dir: string): string {
  return `player_${action}_${dir}`;
}

export function npcAnimKey(_paletteId: number, action: 'idle' | 'walk', dir: string): string {
  // NPCs share the same walk-cycle animations as the player (only the
  // sprite's tint differs per palette, applied in NPC.ts), so all
  // palettes resolve to one shared animation key per action/direction.
  return `player_${action}_${dir}`;
}

/** Builds one idle + one walk animation per direction from the real
 * character spritesheets loaded in PreloadScene (32x48, 6 frames each).
 * The player and every NPC share these — see npcAnimKey. */
export function createAllAnimations(scene: Phaser.Scene): void {
  const anims = scene.anims;

  for (const dir of DIRS) {
    const sheetKey = CharacterSheetKeys.sheet(dir);

    if (!anims.exists(playerAnimKey('idle', dir))) {
      anims.create({
        key: playerAnimKey('idle', dir),
        frames: [{ key: sheetKey, frame: CHARACTER_IDLE_FRAME }],
        frameRate: 1,
        repeat: -1,
      });
    }
    if (!anims.exists(playerAnimKey('walk', dir))) {
      anims.create({
        key: playerAnimKey('walk', dir),
        frames: scene.anims.generateFrameNumbers(sheetKey, { start: 0, end: CHARACTER_WALK_FRAME_COUNT - 1 }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  if (!anims.exists(SPARKLE_ANIM_KEY)) {
    anims.create({
      key: SPARKLE_ANIM_KEY,
      frames: Array.from({ length: SPARKLE_FRAME_COUNT }, (_, i) => ({ key: SparkleFrameKeys.frame(i) })),
      frameRate: 30,
      repeat: 0,
    });
  }
}
