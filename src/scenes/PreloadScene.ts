import Phaser from 'phaser';
import { SCENE_KEYS, GAME_WIDTH, GAME_HEIGHT } from '@/config/GameConfig';
import { PixelArtFactory } from '@/assets/PixelArtFactory';
import { buildings } from '@/world/cityLayout';
import {
  CharacterSheetKeys, CHARACTER_FRAME_WIDTH, CHARACTER_FRAME_HEIGHT,
  REAL_GRASS_KEY, TitleBgLayerKeys, TITLE_BG_LAYER_COUNT,
  SparkleFrameKeys, SPARKLE_FRAME_COUNT,
} from '@/assets/TextureKeys';

/**
 * REAL ASSET CREDITS (loaded here, generated art still comes from
 * PixelArtFactory — see its doc comment): the player/NPC walk cycle is
 * from unTied Games' "Pixel House Set"; the tree sprites and grass ground
 * texture are from unTied Games' "World Map Pixel Art Tileset"; the title
 * screen parallax background is from unTied Games' "Pixel Art Game
 * Backgrounds" (Village 1); the discovery sparkle burst is from unTied
 * Games' "Super Pixel Objects and Items". All from untiedgames.com,
 * supplied by the project owner for this game. See README.md for the
 * full credit list and what was intentionally left unused.
 */
export class PreloadScene extends Phaser.Scene {
  private label!: Phaser.GameObjects.Text;
  private barBg!: Phaser.GameObjects.Rectangle;
  private barFg!: Phaser.GameObjects.Rectangle;
  private barW = 320;

  constructor() {
    super(SCENE_KEYS.PRELOAD);
  }

  preload(): void {
    this.cameras.main.setBackgroundColor('#0d0f14');
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.text(cx, cy - 40, 'TREBIŠOV', {
      fontFamily: 'Georgia, serif', fontSize: '40px', color: '#f0e6c8', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(cx, cy - 6, 'Pixel Explorer', {
      fontFamily: 'Georgia, serif', fontSize: '16px', color: '#8fae5f',
    }).setOrigin(0.5);

    this.barBg = this.add.rectangle(cx, cy + 50, this.barW, 6, 0x2a2c34).setOrigin(0.5);
    this.barFg = this.add.rectangle(cx - this.barW / 2, cy + 50, 4, 6, 0x8fae5f).setOrigin(0, 0.5);
    this.label = this.add.text(cx, cy + 70, 'Loading art…', {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#8a8570',
    }).setOrigin(0.5);

    this.load.on('progress', (p: number) => {
      this.barFg.width = 4 + (this.barW - 4) * p * 0.7; // reserve the last 30% for procedural generation below
    });

    const dirs: Array<'down' | 'up' | 'left' | 'right'> = ['down', 'up', 'left', 'right'];
    for (const dir of dirs) {
      this.load.spritesheet(CharacterSheetKeys.sheet(dir), `assets/character/walk_${dir}.png`, {
        frameWidth: CHARACTER_FRAME_WIDTH,
        frameHeight: CHARACTER_FRAME_HEIGHT,
      });
    }

    this.load.image('tree_a', 'assets/props/tree_a.png');
    this.load.image('tree_b', 'assets/props/tree_b.png');
    this.load.image('tree_c', 'assets/props/tree_c.png');
    this.load.image('tree_d', 'assets/props/tree_d.png');

    this.load.image(REAL_GRASS_KEY, 'assets/tiles/grass.png');

    for (let i = 0; i < TITLE_BG_LAYER_COUNT; i++) {
      this.load.image(TitleBgLayerKeys.layer(i), `assets/title/village_layer${i}.png`);
    }

    for (let i = 0; i < SPARKLE_FRAME_COUNT; i++) {
      const frameNum = String(i).padStart(4, '0');
      this.load.image(SparkleFrameKeys.frame(i), `assets/vfx/sparkle/frame${frameNum}.png`);
    }
  }

  create(): void {
    this.label.setText('Painting the town…');
    // Procedural generation is synchronous and fast; defer one frame so the
    // 70%-full bar actually paints before the (brief) main-thread work.
    this.tweens.add({
      targets: this.barFg,
      width: this.barW,
      duration: 250,
      onComplete: () => {
        const factory = new PixelArtFactory(this);
        factory.generateAll(buildings);
        this.label.setText('Ready.');
        this.time.delayedCall(120, () => this.scene.start(SCENE_KEYS.TITLE));
      },
    });
  }
}
