import Phaser from 'phaser';
import { DEPTH, GAME_WIDTH, GAME_HEIGHT } from '@/config/GameConfig';
import { EventBus, GameEvents } from '@/systems/EventBus';
import { NpcDefinition } from '@/data/npcs';

const BOX_W = 640;
const BOX_H = 92;

/** Lightweight dialogue box for short NPC lines. Not a branching dialogue
 * tree — each interaction just surfaces the NPC's next line. */
export class DialogueBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;
  private lineText: Phaser.GameObjects.Text;
  private hideTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const x = GAME_WIDTH / 2 - BOX_W / 2;
    const y = GAME_HEIGHT - BOX_H - 24;

    this.bg = scene.add.graphics();
    this.bg.fillStyle(0x14161c, 0.92);
    this.bg.fillRoundedRect(0, 0, BOX_W, BOX_H, 10);
    this.bg.lineStyle(2, 0xf0e6c8, 0.5);
    this.bg.strokeRoundedRect(1, 1, BOX_W - 2, BOX_H - 2, 10);

    this.nameText = scene.add.text(20, 12, '', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#8fae5f', fontStyle: 'bold',
    });
    this.lineText = scene.add.text(20, 36, '', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#f0e6c8',
      wordWrap: { width: BOX_W - 40 }, lineSpacing: 4,
    });

    this.container = scene.add.container(x, y, [this.bg, this.nameText, this.lineText]);
    this.container.setDepth(DEPTH.UI + 5);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
    this.container.setAlpha(0);

    EventBus.on(GameEvents.DIALOGUE_OPENED, this.onOpened, this);
  }

  private onOpened(npc: NpcDefinition, line: string): void {
    this.nameText.setText(npc.name);
    this.lineText.setText(line);
    this.show();
  }

  private show(): void {
    this.hideTimer?.remove();
    this.container.setVisible(true);
    this.scene.tweens.add({ targets: this.container, alpha: 1, duration: 160 });
    this.hideTimer = this.scene.time.delayedCall(4200, () => this.hide());
  }

  private hide(): void {
    this.hideTimer?.remove();
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 160,
      onComplete: () => {
        this.container.setVisible(false);
        EventBus.emit(GameEvents.DIALOGUE_CLOSED);
      },
    });
  }
}
