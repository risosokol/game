import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT } from '@/config/GameConfig';
import { PixelArtFactory } from '@/assets/PixelArtFactory';
import { buildings } from '@/world/cityLayout';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.PRELOAD);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0d0f14');

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.text(cx, cy - 40, 'TREBIŠOV', {
      fontFamily: 'Georgia, serif', fontSize: '40px', color: '#f0e6c8', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(cx, cy - 6, 'Pixel Explorer', {
      fontFamily: 'Georgia, serif', fontSize: '16px', color: '#8fae5f',
    }).setOrigin(0.5);

    const barW = 320;
    const barBg = this.add.rectangle(cx, cy + 50, barW, 6, 0x2a2c34).setOrigin(0.5);
    const barFg = this.add.rectangle(cx - barW / 2, cy + 50, 4, 6, 0x8fae5f).setOrigin(0, 0.5);
    const label = this.add.text(cx, cy + 70, 'Painting the town…', {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#8a8570',
    }).setOrigin(0.5);
    void barBg;

    // Generation is synchronous and fast, but we defer it one frame so the
    // loading screen above actually paints before the (brief) main-thread
    // work happens — keeps this a real, if short-lived, loading screen.
    this.tweens.add({
      targets: barFg,
      width: barW,
      duration: 350,
      onComplete: () => {
        const factory = new PixelArtFactory(this);
        factory.generateAll(buildings);
        label.setText('Ready.');
        this.time.delayedCall(120, () => this.scene.start(SCENE_KEYS.TITLE));
      },
    });
  }
}
