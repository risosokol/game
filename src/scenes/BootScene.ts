import Phaser from 'phaser';
import { SCENE_KEYS } from '@/config/GameConfig';

/** Nothing to load from disk in this prototype (all art is generated at
 * runtime), so Boot just hands off to PreloadScene where that generation
 * happens behind a loading screen. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  create(): void {
    this.scene.start(SCENE_KEYS.PRELOAD);
  }
}
