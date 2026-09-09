import Phaser from 'phaser';
import { DEPTH, GAME_WIDTH, GAME_HEIGHT } from '@/config/GameConfig';

/**
 * Subtle daytime lighting pass: a soft warm-to-cool corner gradient plus a
 * gentle vignette, drawn once as a screen-space overlay (scrollFactor 0)
 * above the world but below the UI scene. Cheap (one static Graphics
 * object, no per-frame work) and intentionally understated per the brief
 * — pleasant daytime lighting first, no full day/night cycle yet. The
 * hook is here (see WorldScene) if a slow time-of-day tween is wanted
 * later; for now it just sets the mood.
 */
export function addDayLightingOverlay(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.setScrollFactor(0);
  g.setDepth(DEPTH.OVERLAY);
  g.setBlendMode(Phaser.BlendModes.SOFT_LIGHT);

  g.fillGradientStyle(0xfff2c8, 0xfff2c8, 0x9fc6e0, 0x9fc6e0, 0.5, 0.5, 0.22, 0.22);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // faint vignette
  const vignette = scene.add.graphics();
  vignette.setScrollFactor(0);
  vignette.setDepth(DEPTH.OVERLAY + 1);
  vignette.fillStyle(0x05070a, 0.16);
  vignette.fillRect(0, 0, GAME_WIDTH, 26);
  vignette.fillRect(0, GAME_HEIGHT - 26, GAME_WIDTH, 26);
  vignette.fillRect(0, 0, 26, GAME_HEIGHT);
  vignette.fillRect(GAME_WIDTH - 26, 0, 26, GAME_HEIGHT);
}
