import Phaser from 'phaser';
import { DEPTH, GAME_WIDTH, GAME_HEIGHT } from '@/config/GameConfig';
import { EventBus, GameEvents } from '@/systems/EventBus';
import { Landmark } from '@/data/landmarks';
import { landmarkManager } from '@/systems/LandmarkManager';

const PANEL_W = 460;
const PANEL_H = 190;

/** Elegant landmark info panel shown after a successful discovery
 * interaction. Auto-dismisses, or can be closed early with E/Space/click. */
export class InfoPanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Graphics;
  private title: Phaser.GameObjects.Text;
  private badge: Phaser.GameObjects.Text;
  private body: Phaser.GameObjects.Text;
  private progress: Phaser.GameObjects.Text;
  private hint: Phaser.GameObjects.Text;
  private hideTimer?: Phaser.Time.TimerEvent;
  private closeKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const x = GAME_WIDTH / 2 - PANEL_W / 2;
    const y = 60;

    this.bg = scene.add.graphics();
    this.drawBg();

    this.badge = scene.add.text(24, 18, '', {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#c9bfa0',
    });
    this.title = scene.add.text(24, 36, '', {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#f0e6c8', fontStyle: 'bold',
    });
    this.body = scene.add.text(24, 72, '', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#e6ddc4',
      wordWrap: { width: PANEL_W - 48 }, lineSpacing: 4,
    });
    this.progress = scene.add.text(24, PANEL_H - 30, '', {
      fontFamily: 'Georgia, serif', fontSize: '12px', color: '#8fae5f',
    });
    this.hint = scene.add.text(PANEL_W - 24, PANEL_H - 30, 'Press E to close', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#8a8570',
    }).setOrigin(1, 0);

    this.container = scene.add.container(x, y, [this.bg, this.badge, this.title, this.body, this.progress, this.hint]);
    this.container.setDepth(DEPTH.UI + 10);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);
    this.container.setAlpha(0);

    this.closeKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    EventBus.on(GameEvents.LANDMARK_DISCOVERED, this.onDiscovered, this);

    scene.events.on('update', () => {
      if (this.container.visible && Phaser.Input.Keyboard.JustDown(this.closeKey)) {
        this.hide();
      }
    });
  }

  private drawBg(): void {
    this.bg.clear();
    this.bg.fillStyle(0x14161c, 0.94);
    this.bg.fillRoundedRect(0, 0, PANEL_W, PANEL_H, 10);
    this.bg.lineStyle(2, 0xf0e6c8, 0.55);
    this.bg.strokeRoundedRect(1, 1, PANEL_W - 2, PANEL_H - 2, 10);
    this.bg.lineStyle(1, 0xf0e6c8, 0.25);
    this.bg.strokeRoundedRect(6, 6, PANEL_W - 12, PANEL_H - 12, 7);
  }

  private categoryLabel(cat: Landmark['category']): string {
    switch (cat) {
      case 'heritage': return 'HERITAGE SITE';
      case 'religious': return 'PLACE OF WORSHIP';
      case 'civic': return 'CIVIC BUILDING';
      case 'nature': return 'PARK & GREEN SPACE';
      case 'transport': return 'TRANSPORT';
    }
  }

  private onDiscovered(landmark: Landmark, wasNew: boolean): void {
    this.badge.setText(this.categoryLabel(landmark.category));
    this.title.setText(landmark.name);
    this.body.setText(landmark.info);
    this.progress.setText(
      wasNew
        ? `+ Added to Discovery Journal (${landmarkManager.discoveredCount()}/${landmarkManager.totalCount()})`
        : `Already in your Discovery Journal (${landmarkManager.discoveredCount()}/${landmarkManager.totalCount()})`,
    );

    this.show();
  }

  private show(): void {
    this.hideTimer?.remove();
    this.container.setVisible(true);
    this.container.setScale(0.94);
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scale: 1,
      duration: 220,
      ease: 'Back.Out',
    });
    this.hideTimer = this.scene.time.delayedCall(7000, () => this.hide());
  }

  private hide(): void {
    this.hideTimer?.remove();
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 180,
      onComplete: () => this.container.setVisible(false),
    });
  }
}
