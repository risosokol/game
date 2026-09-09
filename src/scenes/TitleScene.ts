import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT } from '@/config/GameConfig';
import { UITextureKeys } from '@/assets/TextureKeys';
import { audioManager } from '@/systems/AudioManager';
import { saveManager } from '@/systems/SaveManager';
import { landmarkManager } from '@/systems/LandmarkManager';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.TITLE);
  }

  create(): void {
    const bg = this.add.image(0, 0, UITextureKeys.titleBg).setOrigin(0);
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setAlpha(0.9);

    const vign = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0a0c10, 0.35).setOrigin(0);
    void vign;

    const cx = GAME_WIDTH / 2;

    this.add.text(cx, GAME_HEIGHT / 2 - 130, 'TREBIŠOV', {
      fontFamily: 'Georgia, serif', fontSize: '64px', color: '#f0e6c8', fontStyle: 'bold',
    }).setOrigin(0.5).setShadow(2, 3, '#000000', 4, false, true);

    this.add.text(cx, GAME_HEIGHT / 2 - 68, 'PIXEL EXPLORER', {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#8fae5f', letterSpacing: 6 as unknown as number,
    }).setOrigin(0.5);

    this.add.text(cx, GAME_HEIGHT / 2 - 20,
      'A stylised, walkable recreation of Trebišov, Slovakia — explore the streets,\nparks and landmarks of the real town and fill your Discovery Journal.', {
        fontFamily: 'Georgia, serif', fontSize: '14px', color: '#c9bfa0', align: 'center', lineSpacing: 6,
      }).setOrigin(0.5);

    const hasProgress = landmarkManager.discoveredCount() > 0 || saveManager.getPlayerPosition() !== null;

    const prompt = this.add.text(cx, GAME_HEIGHT / 2 + 90,
      hasProgress ? 'Press ENTER / click to continue exploring' : 'Press ENTER / click to begin exploring', {
        fontFamily: 'Georgia, serif', fontSize: '16px', color: '#f0e6c8',
      }).setOrigin(0.5);
    this.tweens.add({ targets: prompt, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });

    if (hasProgress) {
      this.add.text(cx, GAME_HEIGHT / 2 + 120,
        `${landmarkManager.discoveredCount()} / ${landmarkManager.totalCount()} locations discovered so far`, {
          fontFamily: 'Georgia, serif', fontSize: '12px', color: '#8a8570',
        }).setOrigin(0.5);
    }

    const controls = this.add.text(cx, GAME_HEIGHT - 40,
      'WASD / Arrow Keys to move   ·   Shift to jog   ·   E to interact   ·   J for journal', {
        fontFamily: 'Georgia, serif', fontSize: '12px', color: '#6f6a5a',
      }).setOrigin(0.5);
    void controls;

    const start = () => {
      audioManager.unlock();
      audioManager.playUiClick();
      this.scene.start(SCENE_KEYS.WORLD);
      this.scene.launch(SCENE_KEYS.UI);
    };

    this.input.keyboard!.once('keydown-ENTER', start);
    this.input.keyboard!.once('keydown-SPACE', start);
    this.input.once('pointerdown', start);
  }
}
